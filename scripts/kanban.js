//structure classes:
//
//<board>
//  <board-title></board-title>
//  <board-section>--has id
//      <board-section-title></board-section-title>
//      <task>--has id
//          <task-title></task-title>
//      </task>
//  </board-section>
//</board>



$('document').ready(init);

var elementId = 1;
var board;

function init() {
    var result;

    //change get_kanban (in main.js) to take in a variable (owner maybe?). 
    //Then for each board this will create a kanban
    $.get("/get_kanban", function(string) {
        //loop for multiple boards in future
        board = JSON.parse(string)[0];
        console.log('initial json');
        console.log(JSON.stringify(board));
            
               
        var boardDOM = $('<div/>', {'class': 'board', 'title': board.title});                
        var boardTitleDOM = $('<div/>', {'class': 'board-title','innerText': board.title});                
        boardDOM.append(boardTitleDOM);
        //$("#wrapper").append('<div class="owner">' + board.owner + '</div>');
        //$("#wrapper").append('<div class="description">' + board.description + '</description>');
        
        
        for (var columnIndex  = 0; columnIndex < board.columns.length; columnIndex++) {
            var column = board.columns[columnIndex];
            
            var columnDOM = $('<div/>', {'class': 'board-section', 'id': elementId++, 'title': column.title})      
            var columnTitleDOM = $('<div/>', {'class': 'board-section-title', 'innerText': column.title});
            
            boardDOM.append(columnDOM);
            columnDOM.append(columnTitleDOM);
            
            addTasks(column, columnDOM);
            
            if(column.title === 'Backlog')
            {
                var taskDOM = $('<div/>', { 'class': 'task', 'id': elementId++,  'title': 'add new task...'})
                columnDOM.append(taskDOM);
                var taskTitleDOM = $('<div/>', { 'class': 'task-title', 'innerText': 'add new task...' });            
                taskDOM.append(taskTitleDOM);
                taskDOM.append('<div class="plus"><i class="fa fa-plus-circle"></i></div>');
            }
                                        
        }         
        
        var columnDOM = $('<div/>', {'class': 'board-section', 'id': elementId++, 'title': 'Add New Column...'})      
        var columnTitleDOM = $('<div/>', {'class': 'board-section-title', 'innerText': 'Add New Column...'});
      
        boardDOM.append(columnDOM);
        columnDOM.append(columnTitleDOM);
        columnDOM.append('<div class="plus"><i class="fa fa-plus-circle"></i></div>');
                           
        $("#wrapper").prepend(boardDOM);
        
        setupBindings();
    })


}

function addTasks(taskOwner, taskOwnerDOM){
    if (typeof taskOwner.tasks !== 'undefined') {
        for (var taskIndex = 0; taskIndex < taskOwner.tasks.length; taskIndex++) {
            var task = taskOwner.tasks[taskIndex];
            var taskDOM = $('<div/>', { 'class': 'task', 'id': elementId++, 'draggable': 'true', 'title': task.title})
            taskOwnerDOM.append(taskDOM);
            var taskTitleDOM = $('<div/>', { 'class': 'task-title', 'innerText': task.title });            
            taskDOM.append(taskTitleDOM);
            //recursive. tasks can have sub tasks (e.g. user stories)
            addTasks(task, taskDOM);                
        }
    }   
}

//needs to be called after ajax calls
function setupBindings() {
    $('.task').bind('dragstart', function(event) {
        event.originalEvent.dataTransfer.setData("text/plain", event.target.getAttribute('id'));
    });

    $('.task').bind('click', function(event) {
        
        var task = event.target;
        if(task.className === "fa fa-plus-circle")
        {
            task = task.parentElement;            
        }        
        if(task.className === "task-title" || task.className === "plus" || task.className === "board-section-title")
        {
            task = task.parentElement;
        }
        
        $( "#updateTaskForm" ).show();
        $('#old-title').val(task.getAttribute('id'));
        $('#updated-title').val(task.title);
    });

    // bind the dragover event on the board sections
    $('.board-section').bind('dragover', function(event) {
        event.preventDefault();
    });

    // bind the drop event on the board sections
    //DROP IS GOING WITHIN CARD TITLE!!??
    $('.board-section').bind('drop', function(event) {
        //get the new holder and task
        var newHolder = event.target;
        var taskId = event.originalEvent.dataTransfer.getData("text/plain"); //can only be task
        var task = document.getElementById(taskId);
        
        if(newHolder.className === "task-title" || newHolder.className === "board-section-title")
        {
            newHolder = event.target.parentElement;
        }
        
        if(newHolder != task) //dont do anything if the object hasnt moved
        {
            MoveTaskInJsObject(newHolder, task);
            console.log('current json');
            console.log(JSON.stringify(board));
            //UpdateDb();   
            //update the DOM (must be done after)
            newHolder.appendChild(task);        
        }
        
             
        
        // Turn off the default behaviour
        // without this, FF will try and go to a URL with your id's name
        event.preventDefault();
    });
    
    function MoveTaskInJsObject(newHolder, task)
    {
        var oldTaskHolderTitle = task.parentElement.title;//could be task or board-section
        var newTaskHolderTitle = newHolder.title;//could be task or board-section
        var taskTitle = task.title;
        
        var oldTaskHolderObj = searchForProperty(board, oldTaskHolderTitle);
        var newTaskHolderObj = searchForProperty(board, newTaskHolderTitle);
        var taskObj = searchForProperty(oldTaskHolderObj, taskTitle);
        var index = oldTaskHolderObj.tasks.indexOf(taskObj);
        oldTaskHolderObj.tasks.splice(index, 1);
        if((typeof newTaskHolderObj.tasks  === 'undefined'))
        {
            newTaskHolderObj.tasks = [];
        }
        newTaskHolderObj.tasks.push(taskObj);
    }
    //cant find "Setup Development Software"

    
    function searchForProperty(element, taskHolderTitle)
    {
        var result = null;
        if(element.title == taskHolderTitle)
        {
            result = element;
        }
        else if (element.tasks != null && element.tasks.length > 0)
        {
            for(var t=0; result == null && t < element.tasks.length; t++){
                result = searchForProperty(element.tasks[t], taskHolderTitle);
            }
            return result;
        }
        else if (element.columns != null && element.columns.length > 0)//the first level has columns, not tasks
        {
            for(var c=0; result == null && c < element.columns.length; c++){
                result = searchForProperty(element.columns[c], taskHolderTitle);
            }
            return result;
        }
        return result;
    }
    
    $("#saveForm").submit(function(e) {
                
        var url = "update_kanban"; // the script where you handle the form input.
        $.get("/update_kanban", board);
        
        
        e.preventDefault(); // avoid to execute the actual submit of the form.
        
    });
    
    
    $("#updateTaskForm").submit(function(e) {       
               
        var taskId = $('#old-title').val();
        var newTaskTitle = $('#updated-title').val();
        var titleDOM = document.getElementById(taskId);
        
        var taskObj = searchForProperty(board, titleDOM.title);
        
        if(taskObj == null)
        {
            var tasks = board.columns[0].tasks;
            var newTask = {'title': newTaskTitle};
            tasks.push(newTask);
            
            var taskOwnerDOM = document.getElementById(1);//bad
            
            var taskDOM = $('<div/>', { 'class': 'task', 'id': elementId++, 'draggable': 'true', 'title': newTaskTitle})
            taskOwnerDOM.append(taskDOM);
            var taskTitleDOM = $('<div/>', { 'class': 'task-title', 'innerText': newTaskTitle });            
            taskDOM.append(taskTitleDOM);
        }
        else
        {
            taskObj.title = newTaskTitle;
            titleDOM.title = newTaskTitle;
            for (i = 0; i < titleDOM.children.length; i++) {
                if(titleDOM.children[i].className === "task-title")
                {
                    titleDOM.children[i].innerText = newTaskTitle;
                }
            }
        }

        
        e.preventDefault(); // avoid to execute the actual submit of the form.
        
    });



    



}