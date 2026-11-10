
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  // Employee states
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const emptyEmployee = {
    name: "",
    email: "",
    department: "",
    designation: ""
  };

  const [newEmployee, setNewEmployee] = useState(emptyEmployee);

  // Task states
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const emptyTask = {
    title: "",
    description: "",
    employeeId: "",
    dueDate: "",
    status: "Pending"
  };

  const [newTask, setNewTask] = useState(emptyTask);

  const menuItems = ["Dashboard", "Employees", "Tasks"];

  // Fetch employees from Spring Boot
  const fetchEmployees = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/employees"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data = await response.json();
      setEmployees(data);

    } catch (error) {
      console.error("Fetch error:", error);
    }
  };



useEffect(() => {
  fetchEmployees();
  fetchTasks();
}, []);




// Fetch tasks from Spring Boot
const fetchTasks = async () => {
  try {
    const response = await fetch("http://localhost:8080/api/tasks");

    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }

    const data = await response.json();
    setTasks(data);
  } catch (error) {
    console.error("Task fetch error:", error);
  }
};








  // Employee form functions
  const resetForm = () => {
    setNewEmployee(emptyEmployee);
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const openAddForm = () => {
    setNewEmployee(emptyEmployee);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const handleEdit = (employee) => {
    setNewEmployee({
      name: employee.name,
      email: employee.email,
      department: employee.department || "",
      designation: employee.designation || ""
    });

    setEditingId(employee.id);
    setShowForm(true);
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const isEditing = editingId !== null;

      const url = isEditing
        ? `http://localhost:8080/api/employees/${editingId}`
        : "http://localhost:8080/api/employees";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newEmployee)
      });

      if (!response.ok) {
        throw new Error("Unable to save employee. Check the email or server.");
      }

      const savedEmployee = await response.json();

      if (isEditing) {
        setEmployees((previous) =>
          previous.map((employee) =>
            employee.id === editingId ? savedEmployee : employee
          )
        );

        alert("Employee updated successfully!");

      } else {
        setEmployees((previous) => [...previous, savedEmployee]);
        alert("Employee added successfully!");
      }

      resetForm();

    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/employees/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Unable to delete employee");
      }

      setEmployees((previous) =>
        previous.filter((employee) => employee.id !== id)
      );

      alert("Employee deleted successfully!");

      if (editingId === id) resetForm();

    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message);
    }
  };

  // Task form functions
  const resetTaskForm = () => {
    setNewTask(emptyTask);
    setShowTaskForm(false);
    setEditingTaskId(null);
  };

  const openTaskForm = () => {
    if (employees.length === 0) {
      alert("Please add an employee before assigning tasks.");
      return;
    }

    setNewTask(emptyTask);
    setEditingTaskId(null);
    setShowTaskForm(true);
  };

  // Add or update task

const handleTaskSubmit = async (e) => {
  e.preventDefault();

  if (!employees.some(
    (employee) => String(employee.id) === String(newTask.employeeId)
  )) {
    alert("Please select a valid employee.");
    return;
  }

  try {
    const isEditing = editingTaskId !== null;

    const taskPayload = {
      ...newTask,
      employeeId: Number(newTask.employeeId)
    };

    const url = isEditing
      ? `http://localhost:8080/api/tasks/${editingTaskId}`
      : "http://localhost:8080/api/tasks";

    const response = await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(taskPayload)
    });

    if (!response.ok) {
      throw new Error("Unable to save task.");
    }

    const savedTask = await response.json();

    if (isEditing) {
      setTasks((previous) =>
        previous.map((task) =>
          task.id === editingTaskId ? savedTask : task
        )
      );

      alert("Task updated successfully!");
    } else {
      setTasks((previous) => [...previous, savedTask]);

      alert("Task assigned successfully!");
    }

    resetTaskForm();

  } catch (error) {
    console.error("Task save error:", error);
    alert(error.message);
  }
};


  // Delete task
  
const handleTaskDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this task?")) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/api/tasks/${id}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      throw new Error("Unable to delete task.");
    }

    setTasks((previous) =>
      previous.filter((task) => task.id !== id)
    );

    alert("Task deleted successfully!");

  } catch (error) {
    console.error("Task delete error:", error);
    alert(error.message);
  }
};

  // Change task status
 
const handleStatusChange = async (id, status) => {
  try {
    const existingTask = tasks.find(
      (task) => task.id === id
    );

    if (!existingTask) return;

    const updatedTask = {
      ...existingTask,
      status: status
    };

    const response = await fetch(
      `http://localhost:8080/api/tasks/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedTask)
      }
    );

    if (!response.ok) {
      throw new Error("Unable to update task status.");
    }

    const savedTask = await response.json();

    setTasks((previous) =>
      previous.map((task) =>
        task.id === id ? savedTask : task
      )
    );

  } catch (error) {
    console.error("Status update error:", error);
    alert(error.message);
  }
};


  // Get employee name for each task
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(
      (emp) => String(emp.id) === String(employeeId)
    );

    return employee ? employee.name : "Employee not found";
  };

  // Dashboard calculations
  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  // Employee form
  const employeeForm = showForm && (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>{editingId !== null ? "Edit Employee" : "Add New Employee"}</h3>

      <p>Enter the employee details below.</p>

      <input
        type="text"
        placeholder="Employee Name"
        value={newEmployee.name}
        onChange={(e) =>
          setNewEmployee({ ...newEmployee, name: e.target.value })
        }
        required
      />

      <input
        type="email"
        placeholder="Email Address"
        value={newEmployee.email}
        onChange={(e) =>
          setNewEmployee({ ...newEmployee, email: e.target.value })
        }
        required
      />

      <input
        type="text"
        placeholder="Department"
        value={newEmployee.department}
        onChange={(e) =>
          setNewEmployee({ ...newEmployee, department: e.target.value })
        }
      />

      <input
        type="text"
        placeholder="Designation"
        value={newEmployee.designation}
        onChange={(e) =>
          setNewEmployee({ ...newEmployee, designation: e.target.value })
        }
      />

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="primary-button">
          {editingId !== null ? "Update Employee" : "Save Employee"}
        </button>

        <button type="button" className="cancel-button" onClick={resetForm}>
          Cancel
        </button>
      </div>
    </form>
  );

  // Task form
  const taskForm = showTaskForm && (
    <form className="form-container" onSubmit={handleTaskSubmit}>
      <h3>{editingTaskId !== null ? "Edit Task" : "Assign New Task"}</h3>

      <input
        type="text"
        placeholder="Task Title"
        value={newTask.title}
        onChange={(e) =>
          setNewTask({ ...newTask, title: e.target.value })
        }
        required
      />

      <textarea
        placeholder="Task Description"
        value={newTask.description}
        onChange={(e) =>
          setNewTask({ ...newTask, description: e.target.value })
        }
        rows="3"
      />

      <label>Assign Employee</label>

      <select
        value={newTask.employeeId}
        onChange={(e) =>
          setNewTask({ ...newTask, employeeId: e.target.value })
        }
        required
      >
        <option value="">Select Employee</option>

        {employees.map((employee) => (
          <option key={employee.id} value={employee.id}>
            {employee.name} - {employee.department}
          </option>
        ))}
      </select>

      <label>Due Date</label>

      <input
        type="date"
        value={newTask.dueDate}
        onChange={(e) =>
          setNewTask({ ...newTask, dueDate: e.target.value })
        }
        required
      />

      <label>Task Status</label>

      <select
        value={newTask.status}
        onChange={(e) =>
          setNewTask({ ...newTask, status: e.target.value })
        }
      >
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>

      <div className="form-actions">
        <button type="submit" className="primary-button">
          {editingTaskId !== null ? "Update Task" : "Assign Task"}
        </button>

        <button
          type="button"
          className="cancel-button"
          onClick={resetTaskForm}
        >
          Cancel
        </button>
      </div>
    </form>
  );




const handleTaskEdit = (task) => {
  setNewTask({
    title: task.title || "",
    description: task.description || "",
    employeeId: String(task.employeeId || ""),
    dueDate: task.dueDate || "",
    status: task.status || "Pending"
  });

  setEditingTaskId(task.id);
  setShowTaskForm(true);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};





  return (
    <div className="app-container">

      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">Employee Task Management</h2>

        <p className="sidebar-label">MENU</p>

        {menuItems.map((item) => (
          <button
            key={item}
            className={`menu-item ${activePage === item ? "active" : ""}`}
            onClick={() => {
              setActivePage(item);
              resetForm();
              resetTaskForm();
            }}
          >
            {item === "Dashboard" && "▦"}
            {item === "Employees" && "♙"}
            {item === "Tasks" && "☑"}
            <span>{item}</span>
          </button>
        ))}

        <div className="sidebar-footer">
          <div className="profile-circle">KP</div>
          <div>
            <strong>Admin User</strong>
            <small>Administrator</small>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">

        <header className="topbar">
          <div>
            <h2>{activePage}</h2>
            <p>Welcome back! Here's what's happening today.</p>
          </div>

          
        </header>

        {/* Dashboard */}
        {activePage === "Dashboard" && (
          <>
            <section className="stats-grid">

              <div className="stat-card">
                <span>Total Employees</span>
                <h1>{employees.length}</h1>
                <small>Employee records</small>
              </div>

              <div className="stat-card">
                <span>Total Tasks</span>
                <h1>{totalTasks}</h1>
                <small>Tasks assigned</small>
              </div>

              <div className="stat-card">
                <span>Pending Tasks</span>
                <h1>{pendingTasks}</h1>
                <small>Need attention</small>
              </div>

              <div className="stat-card">
                <span>In Progress</span>
                <h1>{inProgressTasks}</h1>
                <small>Currently working</small>
              </div>

              <div className="stat-card">
                <span>Completed Tasks</span>
                <h1>{completedTasks}</h1>
                <small>Successfully completed</small>
              </div>

            </section>

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h3>Recent Employees</h3>
                  <p>Overview of your employee records</p>
                </div>

                <button className="primary-button" onClick={openAddForm}>
                  + Add Employee
                </button>
              </div>

              {employeeForm}

              <EmployeeTable
                employees={employees}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </section>

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h3>Recent Tasks</h3>
                  <p>Overview of assigned employee tasks</p>
                </div>

                <button className="primary-button" onClick={() => {
                  setActivePage("Tasks");
                  resetForm();
                }}>
                  View All Tasks
                </button>
              </div>

              <TaskTable
                tasks={[...tasks].reverse().slice(0, 5)}
                getEmployeeName={getEmployeeName}
                onEdit={handleTaskEdit}
                onDelete={handleTaskDelete}
                onStatusChange={handleStatusChange}
              />
            </section>
          </>
        )}

        {/* Employees */}
        {activePage === "Employees" && (
          <section className="content-card">

            <div className="section-heading">
              <div>
                <h3>Employee Management</h3>
                <p>Manage your employee records</p>
              </div>

              <button className="primary-button" onClick={openAddForm}>
                + Add Employee
              </button>
            </div>

            {employeeForm}

            <EmployeeTable
              employees={employees}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

          </section>
        )}

        {/* Tasks */}
        {activePage === "Tasks" && (
          <section className="content-card">

            <div className="section-heading">
              <div>
                <h3>Task Management</h3>
                <p>Assign and manage tasks for your employees</p>
              </div>

              <button className="primary-button" onClick={openTaskForm}>
                + Assign Task
              </button>
            </div>

            {taskForm}

            <TaskTable
              tasks={tasks}
              getEmployeeName={getEmployeeName}
              onEdit={handleTaskEdit}
              onDelete={handleTaskDelete}
              onStatusChange={handleStatusChange}
            />

          </section>
        )}

      </main>
    </div>
  );
}

// Employee Table Component
function EmployeeTable({ employees, onEdit, onDelete }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.length > 0 ? (
            employees.map((employee) => (
              <tr key={employee.id}>
                <td>
                  <strong>{employee.name}</strong>
                  <small className="email">{employee.email}</small>
                </td>

                <td>{employee.department}</td>
                <td>{employee.designation}</td>

                <td>
                  <span className="status active">Active</span>
                </td>

                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-button"
                      onClick={() => onEdit(employee)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => onDelete(employee.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="empty-message">
                No employees found. Click Add Employee to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Task Table Component
function TaskTable({
  tasks,
  getEmployeeName,
  onEdit,
  onDelete,
  onStatusChange
}) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Assigned To</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <strong>{task.title}</strong>
                  <small className="email">{task.description}</small>
                </td>

                <td>{getEmployeeName(task.employeeId)}</td>

                <td>{task.dueDate}</td>

                <td>
                  <select
                    className="task-status-select"
                    value={task.status}
                    onChange={(e) =>
                      onStatusChange(task.id, e.target.value)
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>

                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-button"
                      onClick={() => onEdit(task)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => onDelete(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="empty-message">
                No tasks assigned yet. Click Assign Task to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
