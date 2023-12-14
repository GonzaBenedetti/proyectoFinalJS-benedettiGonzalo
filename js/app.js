const todayTasks = document.querySelector("#todayTasks");
const tasks = document.querySelector("#tasks");
const settings = document.querySelector("#settings");
const container = document.querySelector(".container");

let listTasks = JSON.parse(localStorage.getItem("Tasks")) || [];

function NewTask(description, title, date) {
    this.title = title;
    this.date = date;
    this.description = description;
}

const createNewTask = () => {
    let sett = document.querySelector(".sectionSettings");
    let tTasks = document.querySelector(".tTasks");
    let schTasks = document.querySelector(".sectionSchTasks");

    removeIfExists(schTasks);
    removeIfExists(sett);

    if (!tTasks) {
        const section = document.createElement("section");
        const div = document.createElement("div");

        section.setAttribute("class", "tTasks");
        document.querySelector(".container").appendChild(section);

        div.setAttribute("class", "containerCreateTask");
        document.querySelector(".tTasks").appendChild(div);

        div.innerHTML =
            `<form action="">
                <div class="optionTask">
                    <input type="radio" name="optionCheck" id="personalCheck" class="personalCheck" value="personal">
                    <label for="personalCheck"><span class="radio-button colorPC"></span></label>

                    <input type="radio" name="optionCheck" id="leisureCheck" class="leisureCheck" value="leisure">
                    <label for="leisureCheck"><span class="radio-button colorLC"></span></label>

                    <input type="radio" name="optionCheck" id="workCheck" class="workCheck" value="work">
                    <label for="workCheck"><span class="radio-button colorWC"></span></label>
                </div>

                <input type="text" name="title" id="inTask" class="inTask" placeholder="Enter a task..." autofocus required>
                <label for="inTask"></label>
        
                <input type="date" name="date" id="dateTask" class="dateTask" required>
                <label for="dateTask"></label>
        
                <button class="btn" id="saveTask"><i class='bx bx-chevron-right'></i></button>
                
            </form>`;

        const btnSave = document.querySelector(`#saveTask`);

        btnSave.addEventListener("click", (e) => {
            e.preventDefault();
            const selectedRadio = document.querySelector('input[name="optionCheck"]:checked');
            const valueRadTask = selectedRadio ? selectedRadio.value : null;
            const titleTask = document.querySelector(`#inTask`);
            const dateTask = document.querySelector(`#dateTask`);

            if (validateForm(titleTask, dateTask, valueRadTask)) {
                sendTask(valueRadTask, titleTask, dateTask);
                showScheduledTasks();
            }
        });

        document.addEventListener("keyup", (e) => {
            e.preventDefault();
            if (e.key === "Enter") {
                const selectedRadio = document.querySelector('input[name="optionCheck"]:checked');
                const valueRadTask = selectedRadio ? selectedRadio.value : null;
                const titleTask = document.querySelector(`#inTask`);
                const dateTask = document.querySelector(`#dateTask`);

                if (validateForm(titleTask, dateTask, valueRadTask)) {
                    sendTask(valueRadTask, titleTask, dateTask);
                    showScheduledTasks();
                }
            }
        });
    }
};

const validateForm = (titleTask, dateTask, valueRadTask) => {
    if (!titleTask.value || !dateTask.value || !valueRadTask) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'All fields are required',
        });
        return false;
    }
    return true;
};

const sendTask = (valueRadTask, titleTask, dateTask) => {
    let newTask = new NewTask(valueRadTask, titleTask.value, dateTask.value);
    listTasks.push(newTask);
    saveStorage("Tasks", JSON.stringify(listTasks));

    titleTask.value = "";
    dateTask.value = "";
};

const showTodayTasks = () => {
    let sett = document.querySelector(".sectionSettings");
    let tTasks = document.querySelector(".tTasks");
    let schTasks = document.querySelector(".sectionSchTasks");

    if (tTasks) {
        tTasks.remove();
    }
    if (sett) {
        sett.remove();
    }
    if (schTasks) {
        schTasks.remove();
    }

    const section = document.createElement("section");
    const div = document.createElement("div");

    section.setAttribute("class", "tTasks");
    document.querySelector(".container").appendChild(section);

    div.setAttribute("class", "containerTodayTasks");
    document.querySelector(".tTasks").appendChild(div);

    const today = new Date().toISOString().split("T")[0];
    const todayTasks = listTasks.filter(task => task.date === today);

    div.innerHTML = "<h2>Today's Tasks</h2>";
    if (todayTasks.length > 0) {
        const taskList = document.createElement("ul");
        todayTasks.forEach(task => {
            const listItem = document.createElement("li");
            listItem.textContent = `${task.title} - ${task.description}`;
            taskList.appendChild(listItem);
        });
        div.appendChild(taskList);
    } else {
        div.innerHTML += "<p>No tasks for today.</p>";
    }
};

const showScheduledTasks = () => {
    let sett = document.querySelector(".sectionSettings");
    let tTasks = document.querySelector(".tTasks");
    let schTasks = document.querySelector(".sectionSchTasks");

    removeIfExists(tTasks);
    removeIfExists(sett);

    if (!schTasks) {
        const section = document.createElement("section");
        const div = document.createElement("div");

        section.setAttribute("class", "sectionSchTasks");
        document.querySelector(".container").appendChild(section);

        div.setAttribute("class", "containerschTasks");
        document.querySelector(".sectionSchTasks").appendChild(div);

        const sortedTasks = sortTasksByDate(listTasks);

        if (sortedTasks.length > 0) {
            const uniqueDates = [...new Set(sortedTasks.map(task => task.date))];

            uniqueDates.forEach(date => {
                const tasksForDate = sortedTasks.filter(task => task.date === date);

                const taskList = document.createElement("ul");
                taskList.innerHTML = `<h3>${formatDate(date)}</h3>`;

                tasksForDate.forEach((task, index) => {
                    const listItem = document.createElement("li");
                    listItem.setAttribute("data-task-id", task.id)

                    listItem.innerHTML =
                        `<span><i class='bx bxs-circle ${task.description}'></i>
                        <p>${task.title}</p></span>
                        <i class='bx bxs-trash'></i>`;

                    const trashIcon = listItem.querySelector('.bx.bxs-trash');
                    trashIcon.addEventListener('click', () => deleteTask(index));

                    taskList.appendChild(listItem);
                });

                div.appendChild(taskList);
            });
        } else {
            div.innerHTML += "<h3>You have no pending tasks.</h3>";
        }
    }
};

const sortTasksByDate = (tasks) => {
    return tasks.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
};

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

const deleteTask = (taskId) => {
    Swal.fire({
        title: 'Are you sure?',
        text: 'Are you sure you want to delete this task?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete'
    }).then((result) => {
        if (result.isConfirmed) {
            try {
                listTasks = listTasks.filter(task => task.id !== Number(taskId));
                saveStorage("Tasks", JSON.stringify(listTasks));
                showScheduledTasks();

                const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
                if (taskElement) {
                    taskElement.remove();
                } else {
                    console.warn('Task element not found for ID:', taskId);
                }

            } catch (error) {
                console.error('Error deleting the task:', error);
            }
        }
    });
};

const showSettings = () => {
    let sett = document.querySelector(".sectionSettings");
    let tTasks = document.querySelector(".tTasks");
    let schTasks = document.querySelector(".sectionSchTasks");

    removeIfExists(tTasks);
    removeIfExists(schTasks);
    if (!sett) {
        const section = document.createElement("section");
        const div = document.createElement("div");

        section.setAttribute("class", "sectionSettings");
        document.querySelector(".container").appendChild(section);

        div.setAttribute("class", "containerSettings");
        document.querySelector(".sectionSettings").appendChild(div);

        div.innerHTML = `<h4><i class='bx bx-user-circle'></i>Profile</h4>
        <hr>
        <ul>
            <li id="editProfile">Edit Profile<i class='bx bxs-chevron-right'></i></li>
            <li id="changePass">Change password<i class='bx bxs-chevron-right'></i></li>
            <li id="privacy">Privacy<i class='bx bxs-chevron-right'></i></li>
        </ul>

        <h4><i class='bx bx-notification'></i>Notification</h4>
        <hr>
        <ul>
            <li id="notif">Notifications<i class='bx bxs-chevron-right'></i></li>
            <li id="tasksNotif">Tasks notification<i class='bx bxs-chevron-right'></i></li>
        </ul>

        <h4><i class='bx bx-user-circle'></i>More</h4>
        <hr>
        <ul>
            <li id="language">Language<i class='bx bxs-chevron-right'></i></li>
            <li id="country">Country<i class='bx bxs-chevron-right'></i></li>
        </ul>`;
    }
};

const loadTasksFromJSON = async () => {
    try {
        const response = await fetch('tasks.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const tasks = await response.json();
        listTasks = tasks;
        showScheduledTasks();

    } catch (error) {
        console.error('Error loading tasks from JSON:', error);
    }
};

const removeIfExists = (element) => {
    if (element) {
        element.remove();
    }
};

const saveStorage = (key, value) => localStorage.setItem(key, value);

todayTasks.addEventListener("click", createNewTask);
tasks.addEventListener("click", showScheduledTasks);
settings.addEventListener("click", showSettings);


loadTasksFromJSON();