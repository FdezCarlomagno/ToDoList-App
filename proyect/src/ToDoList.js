import { useState, useEffect } from 'react'
import React from 'react'
import './ToDoList.css'
import { TaskNotes } from './TaskNotes';
import { SearchBar } from './SearchBar';



const PriorityButton = ({ className, onClick }) => {
    return (
        <button onClick={onClick} className={className}>

        </button>
    );
};

const ProgressBar = ({ tasks }) => {
    const [tasksDone, setTasksDone] = useState(0)


    useEffect(() => {
        const completedTasks = tasks.filter(task => task.done)
        setTasksDone(completedTasks.length)
    }, [tasks])

    const amountTasks = tasks.length
    const progress = (tasksDone / amountTasks) * 100
    return (
        <div className='progressBar'>
            <label htmlFor="progress">{progress.toFixed(0)}%</label>
            <progress id="progress" max="100" value={progress}>{progress}</progress>
        </div>
    )
}





const API_URL = 'https://6681995604acc3545a072275.mockapi.io/ToDoList/tasks/dataTasks';

function ToDoList() {
    const [tasks, setTasks] = useState([]);
    const [value, setValue] = useState('');
    const [input, showInput] = useState(false)
    const [inputId, setInputId] = useState('')
    const [selectedOption, setSelectedOption] = useState('everything')
    const [searchBar, setSearchBar] = useState(false)
    //console.log(taskQuantity)

    const crossSvg = <svg className='crossSvg' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>

    const searchSvg = <svg className='searchSvg'xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
  

    //SORTING FUNCTIONS

    const sortByName = () => {
        const updatedTasks = tasks.sort((a, b) => {
            const taskA = a.text.toUpperCase()
            const taskB = b.text.toUpperCase()
            if (taskA < taskB) {
                return -1
            }
            if (taskA > taskB) {
                return 1
            }
            return 0
        })
        setTasks(updatedTasks)
    }
    const sortByPriority = () => {
        const updatedTasks = [...tasks].sort((a, b) => {
            const priorityOrder = ['highPriority', 'mediumPriority', 'lowPriority', 'noPriority']
            const priorityA = priorityOrder.indexOf(a.priority)
            const priorityB = priorityOrder.indexOf(b.priority)

            // Compare priorities first
            if (priorityA < priorityB) {
                return -1;
            } else if (priorityA > priorityB) {
                return 1;
            } else {
                return 0;
            }
        })
        setTasks(updatedTasks)
    }
    const unsortTasks = () => {
        const a = [...tasks]
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        setTasks(a)
    }

    const handleSelectChange = (event) => {
        const option = event.target.value
        setSelectedOption(event.target.value)
        console.log(option)
        if (option === 'everything') {
            unsortTasks()
        }
        else if (option === 'name') {
            sortByName()
        } else if (option === 'priority') {
            sortByPriority()
        }
    }

    const handlePriority = (index, priority) => {
        const taskId = tasks[index].id;
        const updatedTasks = [...tasks];
        updatedTasks[index].priority = priority;
        console.log(priority)
        changeApiPriority(priority, taskId)
        setTasks(updatedTasks);

    };


    const handleTaskRemove = (index) => {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
        deleteTaskFromApi(tasks[index].id)
    };


    /*API FUNCTIONS*/

    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                setTasks(data);
                //setOriginalTasks(data)
            })
            .catch(err => {
                console.error('Error fetching tasks:', err);
            });
    }, []);

    //DELETE TASK 

    const deleteTaskFromApi = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            })
            if (!response.ok) {
                throw new Error('failed to delete task')
            }
            setTasks(tasks.filter(task => task.id !== id))

        } catch (error) {
            console.log(error)
        }
    }

    //ADD TASK 

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (value.trim() !== '') {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text: value, done: false }),
                });

                if (!response.ok) {
                    throw new Error('Failed to add task');
                }

                const result = await response.json();
                //console.log('Task added successfully', result);
                //console.log(tasks)

                setTasks([{ id: result.id, text: value, done: false, priority: 'noPriority', notes: '' }, ...tasks]);
                setValue('');
            } catch (error) {
                console.error('Error adding task:', error);
            }
        }
    };

    //EDIT DONE VALUE

    const handleTaskDone = async (taskId, index) => {
        const task = tasks[index].id
        const taskToUpdate = tasks.find(task => task.id === taskId);
        if (!taskToUpdate) return;
        //si la task esta done cambiamos la prioridad a noPriority

        const updatedTask = { ...taskToUpdate, done: !taskToUpdate.done, priority: 'noPriority', notes: '' };

        try {
            const response = await fetch(`${API_URL}/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTask),
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            // Update local state with the updated task
            const updatedTasks = tasks.map(task =>
                task.id === taskId ? updatedTask : task
            );
            setTasks(updatedTasks);
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    //CHANGE PRIORITY
    const changeApiPriority = async (priority, id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ priority: priority })
            })
            if (!response.ok) {
                throw new Error('Error on changing priority')
            }
            const updatedTasks = tasks.map(task =>
                task.id === id ? { ...task, priority: priority } : task
            )
            setTasks(updatedTasks)
        } catch (error) {
            console.error(error)
        }
    }

    //EDIT TASK

    const editTaskFromApi = async (id, editValue) => {

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: editValue })
            })
            if (!response.ok) {
                throw new Error('error in editing the task')
            }
            const updatedTasks = tasks.map(task =>
                task.id === id ? { ...task, text: editValue } : task
            )
            setTasks(updatedTasks)
        } catch (err) {
            console.error(err)
        }
    }


    const handleEditTask = (id) => {
        showInput(!input)
        setInputId(id)
    }

    //INPUT COMPONENT
    const InputComponent = ({ id, initialText, onSave }) => {
        const [editInputValue, setEditInputValue] = useState(initialText);

        const handleEditChange = event => {
            //console.log(event.target.value)
            setEditInputValue(event.target.value);
        }

        const handleSubmit = (event) => {
            event.preventDefault();
            setEditInputValue('')
            showInput(!input)
            onSave(id, editInputValue);
        };

        return (
            <div className={input ? 'showEditForm' : ''}>
                {input && (
                    <form className='editTaskForm' onSubmit={handleSubmit}>
                        <button className='btnExitEdit' onClick={() => setEditInputValue(initialText)}>
                            x
                        </button>
                        <input
                            type='text'
                            placeholder='Edit your task here'
                            onChange={handleEditChange}
                            value={editInputValue}
                        />
                        <button type='submit' className='btnSaveChanges'>Save changes</button>
                    </form>
                )}
            </div>
        )
    }
    const [darkMode, setDarkMode] = useState(false)

    const toggleDarkMode = () => {
        setDarkMode(!darkMode)
    }
    const handleSearchBar = () => {
        setSearchBar(!searchBar)
    }
    return (
        <div className={darkMode ? 'darkMode' : ''} id='Body'>
            <main className={darkMode ? 'darkMode' : ''} id='noDark'>
                <div className='btnDarkModeFlex'>
                    <button className='btnDarkMode'
                        onClick={toggleDarkMode}
                    >{darkMode ? 'Light mode' : 'Dark mode'}</button>
                </div>
                {tasks.length > 0 && <ProgressBar tasks={[...tasks]}></ProgressBar>}
                <div className='toDoList'>
                    <h1>TO DO LIST</h1>

                    <form className='formToDoList' onSubmit={handleSubmit}>
                        <input
                            className='inputToDoList'
                            onChange={(e) => setValue(e.target.value)}
                            value={value}
                            placeholder='Enter a task'
                        />
                        <button type='submit'>Add task</button>
                    </form>
                    <div className='cont-list'>
                        <label htmlFor='sortSelect'>Sort by</label>
                        <select className='sortSelect'
                            value={selectedOption}
                            onChange={handleSelectChange}
                        >
                            <option value='everything'>Unsorted</option>
                            <option value='priority'>Priority</option>
                            <option value='name'>Name</option>
                        </select>
                    </div>
                    {tasks.length > 0 &&
                        <ul className='list'>
                            {tasks.length == 0 && <span className='noTasks'>No tasks yet</span>}
                            {tasks.map((task, index) => (
                                <div key={task.id} className='fatherCont'>
                                    <button className={task.done ? 'hideButton' : 'editButton'}
                                        onClick={
                                            () => handleEditTask(task.id)
                                        }>Edit</button>
                                    {inputId === task.id && <InputComponent
                                        id={task.id}
                                        initialText={task.text}
                                        onSave={editTaskFromApi}

                                    />}
                                    <div className={task.done ? '' : task.priority} id='task'>
                                        <li className={`${task.done ? 'taskDone' : ''}`}>
                                            <span>{task.text}</span>
                                            <input
                                                type='checkbox'
                                                onChange={() => handleTaskDone(task.id, index)}
                                                checked={task.done}
                                                className='checkbox'
                                            />
                                            <button
                                                className='removeTask'
                                                onClick={() => handleTaskRemove(index)}
                                            >
                                                {crossSvg}
                                            </button>
                                        </li>
                                        {!task.done && <TaskNotes tasks={[...tasks]} id={task.id}></TaskNotes>}
                                        <div className='priorityButtons'>
                                            <div className={task.done ? 'hiddenButtons' : ''}>
                                                <PriorityButton
                                                    className='btnhighPriority'
                                                    onClick={() => handlePriority(index, 'highPriority')}
                                                />
                                                <PriorityButton
                                                    className='btnmediumPriority'
                                                    onClick={() => handlePriority(index, 'mediumPriority')}
                                                />
                                                <PriorityButton
                                                    className='btnlowPriority'
                                                    onClick={() => handlePriority(index, 'lowPriority')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </ul>
                    }
                </div>
            </main>
        </div>
    );
}

export default ToDoList;