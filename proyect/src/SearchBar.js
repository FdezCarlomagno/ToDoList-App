import React from 'react'
import { useState } from 'react'

export const SearchBar = ({ tasks }) => {
    const [searchValue, setSearchValue] = useState('')
    const [filteredTasks, setFilteredTasks] = useState([...tasks])

    const handleChange = (event) => {
        const currentSearch = event.target.value
        setSearchValue(currentSearch)
        const filtered = tasks.filter(task => (task.text).toLowerCase().includes(currentSearch))
        setFilteredTasks(filtered)
    }

    return (
        <div className='searchBarCont'>
            <input 
            type='text'
            onChange={(event)=> handleChange(event)}
            value={searchValue}
            />
            {console.log(searchValue)}
        </div>
    )
}