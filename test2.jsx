import { useEffect, useState } from 'react';
import style from './style.module.css'
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import SelectCat from './SelectCat';
import axios from 'axios';
export default function ProjectsForm({closeForm,addProject}) {
  const [project,setProject]=useState({
    title:'',
    description:'',
    students:[],
    category:'',
    startDate:'',
    endDate:'',
    status:''
  });
  const [users,setUsers]=useState([]);
  const getUsers=async ()=>{
    try{
      const query = `query Users {
        users {
          id
          username
          type
          uid
        }
      }`;
      
      const {data} = await axios.post("http://localhost:4001/graphql", {
        query
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Filter users to only include students
      const studentUsers = data.data.users.filter(user => user.type === "student");
      setUsers(studentUsers);
    }catch(error){
      console.log(error);
    }
  }
  useEffect(() => {
    getUsers();
  },[])
  const handleChange=(e)=>{
    const { name, value, multiple, options } = e.target;

    if (multiple) {
      const selectedValues = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
      setProject(prevProjects => ({
        ...prevProjects,
        [name]: selectedValues
      }));
    } else {
      setProject(prevProjects => ({
        ...prevProjects,
        [name]: value
      }));
    }
    
  }
  const createProject=(e)=>{
    e.preventDefault();
    addProject(project);
    
    closeForm(false);
  }
 const clearForm=()=>{
  toast.info("Form cleared !");
  setProject({
    title:'',
    description:'',
    students:[],
    category:'',
    startDate:'',
    endDate:'',
    status:''
  });
 }
  return (
    <form onSubmit={createProject} className={"w-full my-3 px-[15px] flex flex-col gap-3 overflow-auto h-[430px]  text-white "+ style.formScroll}>
      <div className="inputContainer flex flex-col gap-2 w-full ">
        <h3 className=" text-lg font-semibold">Project Title :</h3>
        <input required value={project.title} name={'title'} onChange={handleChange} type="text" className=" outline-0 bg-[#333333] p-[6px] border-2 border-[#454545] rounded-lg"/>
      </div>
      <div className="inputContainer flex flex-col gap-2 w-full ">
        <h3 className=" text-lg font-semibold">Project Description :</h3>
        <textarea required value={project.description} name={'description'} onChange={handleChange} rows={5} className=" outline-0 bg-[#333333] p-[6px] border-2 border-[#454545] rounded-lg" id=""></textarea>
      </div>
      <div className="inputContainer flex flex-col gap-2 w-full ">
        <h3 className=" text-lg font-semibold">Students List :</h3>
        <select required value={project.students} name='students' onChange={handleChange} multiple={true} size={"5"} className=' duration-200 outline-0 bg-[#333333] p-[6px] border-2 border-[#454545] rounded-lg '>
          {users?users.map((user,index)=>{
            if(user.type!='admin')
            return <option value={user.id} key={index} className=' '>{user.username}</option>
            }):""}
        </select>
      </div>
      <SelectCat value={project.category} handleChange={handleChange}/>
      <div className="inputContainer flex flex-col gap-2 w-full ">
        <h3 className=" text-lg font-semibold">Starting Date :</h3>
        <input required value={project.startDate} name='startDate' onChange={handleChange} type="date" className=" outline-0 bg-[#333333] p-[6px] border-2 border-[#454545] rounded-lg"/>
      </div>
      <div className="inputContainer flex flex-col gap-2 w-full ">
        <h3 className=" text-lg font-semibold">Ending Date :</h3>
        <input required value={project.endDate} name='endDate' onChange={handleChange} type="date" className=" outline-0 bg-[#333333] p-[6px] border-2 border-[#454545] rounded-lg"/>
      </div>
     <div className="inputContainer flex flex-col gap-2 w-full ">
        <h3 className=" text-lg font-semibold">Project Status :</h3>
        <select required value={project.status} name='status' onChange={handleChange} className=' duration-200 outline-0 bg-[#333333] p-[6px] border-2 border-[#454545] rounded-lg '>
          <option value="status" className=' '>status</option>
          <option value="inProgress" className=' '>In Progress</option>
          <option value="completed" className=' '>Completed</option>
          <option value="pending" className=' '>Pending</option>
          <option value="onHold" className=' '>On Hold</option>
          <option value="cancelled" className=' '>Cancelled</option>
        </select>
      </div>
      <div className="btns flex items-center gap-6">
      <button type='button' className='  text-[#027bfe] hover:bg-[rgba(3,125,255,0.2)] py-[10px] cursor-pointer duration-300 rounded-lg  flex-1' onClick={clearForm}>Clear</button>
      <button  className=' bg-[rgba(3,125,255,0.4)] hover:bg-[#027bfe] py-[10px] cursor-pointer duration-300 rounded-lg  flex-1' type='submit'>Add</button>
      </div>
    </form>
  )
}
