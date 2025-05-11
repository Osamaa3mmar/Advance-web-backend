import { useContext, useEffect, useMemo, useState } from "react";
import Modal from "../../component/Modal/Modal";
import ProjectsForm from "../../component/Projects/Form/ProjectsForm";
import SideOpen from "../../component/Projects/SideOpen/SideOpen";
import Tools from "../../component/Projects/Tools/Tools";
import ProjectArea from "../../component/Projects/ProjectsArea/ProjectArea";
import { CurrentUserContext } from "../../Context/CurrentUserContext";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';

export default function Projects() {
  const [modal, setModal] = useState(false);
  const [side, setSide] = useState(false);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const { user } = useContext(CurrentUserContext);
  const getData = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        return;
      }

      // GraphQL query for getting all projects
      const query = `
        query Projects {
          projects {
            id
            name
            startDate
            endDate
            description
            status
            category
            users {
              id
              username
              type
              uid
            }
          }
        }
      `;

      const response = await axios.post("http://localhost:4001/graphql", {
        query
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const graphqlProjects = response.data.data.projects;
      const formattedProjects = graphqlProjects.map(project => ({
        id: project.id,
        title: project.name,
        description: project.description,
        students: project.users,
        category: project.category,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status
      }));
      if (user && user.role != 'admin') {

        const filteredProjects = formattedProjects.filter(project => {
          console.log(project, "project")
          return project.students.find(student => {
            console.log(student, "studentId")
            return user && student.id == user.id;
          });
        });
        setData(filteredProjects);
        console.log(filteredProjects)
      } else
        setData(formattedProjects);
    } catch (error) { }
    // const projects=JSON.parse(localStorage.getItem('projects'));
    // if(!projects){
    //   setData([]);
    // }
    // else if(user&&user.role!='admin'){
    //   const temp=projects.filter((project)=>{
    //     return project.students.find((studentId)=>{
    //       return user && studentId==user.id;
    //     });
    //   })
    //   setData(temp);
    // }else{
    //   setData(projects);
    // }
  }

  const filteredData = useMemo(() => {
    if (!search) {
      return data
    }
    if (search.type == 'title')
      return data.filter((project) => {
        return project.title.toLowerCase().includes(search.title.toLowerCase());
      })

    else
      return data.filter((project) => {
        return project.status.toLowerCase().includes(search.status.toLowerCase());
      })
  }, [data, search]);

  const addProject = async (projectData) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        return;
      }

      // GraphQL mutation for creating a project using variables
      const query = `
        mutation CreateProject($input: CreateProjectInput!) {
          createProject(input: $input) {
            id
            name
            startDate
            endDate
            description
            status
            category
            users {
              id
              username
              type
              uid
            }
          }
        }
      `;

      // Define variables for the GraphQL mutation
      const variables = {
        input: {
          name: projectData.title,
          startDate: projectData.startDate,
          endDate: projectData.endDate,
          description: projectData.description,
          status: projectData.status,
          category: projectData.category
        }
      };

      const response = await axios.post("http://localhost:4001/graphql", {
        query,
        variables
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      // Get the created project from response
      const createdProject = response.data.data.createProject;

      // Assign users to the project
      if (projectData.students && projectData.students.length > 0) {
        console.log(projectData.students, "nvonon")
        console.log(`Assigning ${projectData.students.length} users to project ${createdProject.id}`);
        console.log('User IDs:', projectData.students);

        try {
          // Use Promise.all to assign all users in parallel
          await Promise.all(projectData.students.map(async (userId) => {
            console.log(`Assigning user ${userId} to project ${createdProject.id}`);

            const assignUserQuery = `
             mutation AssignUserToProject {
    assignUserToProject(projectId: "${createdProject.id}", userId: "${userId}")
}

            `;

            console.log(assignUserQuery, "variables")
            try {
              const response = await axios.post("http://localhost:4001/graphql", {
                query: assignUserQuery,
              }, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              });

              console.log(`Assignment response for user ${userId}:`, response.data);

              if (response.data.errors) {
                console.error(`Error assigning user ${userId}:`, response.data.errors);
                toast.error(`Failed to assign user ${userId}: ${response.data.errors[0].message}`);
              } else if (response.data.data && response.data.data.assignUserToProject === true) {
                console.log(`Successfully assigned user ${userId} to project ${createdProject.id}`);
              }
            } catch (assignError) {
              console.error(`Error in assignment request for user ${userId}:`, assignError);
              toast.error(`Assignment request failed for user ${userId}: ${assignError.message}`);
            }
          }));
        } catch (assignmentError) {
          console.error('Error during user assignments:', assignmentError);
          toast.error(`Some user assignments failed: ${assignmentError.message}`);
        }
      } else {
        console.log('No users to assign to the project');
      }

      // Format the project to match the expected structure in the app
      const formattedProject = {
        id: createdProject.id,
        title: createdProject.name,
        description: createdProject.description,
        students: projectData.students,
        category: createdProject.category,
        startDate: createdProject.startDate,
        endDate: createdProject.endDate,
        status: createdProject.status
      };

      // Update the state with the new project
      setData(prevData => [...prevData, formattedProject]);
      Swal.fire({
        title: "Project created successfully !",
        icon: "success"
      });
      setModal(false);
      // Refresh the project list
      getData();


      toast.success("Project created successfully!");
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(`Failed to create project: ${error.message}`);
    }
  }

  const deleteProject = async (id) => {
    try {
      // Use GraphQL variables instead of string interpolation
      const query = `mutation DeleteProject($id: ID!) {
        deleteProject(id: $id)
      }`;

      const { data } = await axios.post("http://localhost:4001/graphql", {
        query,
        variables: { id } // Pass ID as a variable
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });


      // Check for successful deletion (returns true)
      if (data.data && data.data.deleteProject === true) {
        toast.success("Project deleted successfully");
        getData();
      } else {
        const errorMessage = data.errors?.[0]?.message || "Failed to delete project";
        toast.error(errorMessage);
      }
    }
    catch (error) {
      console.log(error);
      toast.error("Error deleting project: " + (error.message || "Unknown error"));
    }
  }

  useEffect(() => {
    getData();
  }, [user])

  return (
    <div className=" scroll w-[95%] m-auto  min-h-[100dvh] ">
      <Tools searchTerm={setSearch} modelControl={setModal} />
      <Modal status={modal} onClose={setModal} title={"Add New Project"}>
        <ProjectsForm addProject={addProject} closeForm={setModal} />
      </Modal>
      <SideOpen status={side} closeSide={setSide} />
      <ProjectArea deleteProject={deleteProject} projects={filteredData} openSide={setSide} />
    </div>
  )
}
