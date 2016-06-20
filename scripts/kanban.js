//structure classes:
//
//<board>
//  <board-title></board-title>
//  <column>--has id
//      <column-title></column-title>
//      <task>--has id
//          <task-title></task-title>
//      </task>
//  </column>
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
            
            var columnDOM = $('<div/>', {'class': 'column', 'id': elementId++, 'title': column.title})      
            var columnTitleDOM = $('<div/>', {'class': 'column-title', 'innerText': column.title});
            var columnCloseDOM = $('<i/>', {'class': 'fa fa-times'});
            
            boardDOM.append(columnDOM);
            columnDOM.append(columnCloseDOM);
            columnDOM.append(columnTitleDOM);
            
            addTasks(column, columnDOM);
            
            if(column.title === 'Backlog')
            {
                var taskDOM = $('<div/>', { 'class': 'task', 'id': 'task-adder',  'title': 'add new task...'})
                var taskTitleDOM = $('<div/>', { 'class': 'task-title', 'innerText': 'add new task...' });    
                columnDOM.append(taskDOM);        
                taskDOM.append(taskTitleDOM);
                taskDOM.append('<div class="plus"><i class="fa fa-plus-circle"></i></div>');
            }
                                        
        }         
        
        var columnDOM = $('<div/>', {'class': 'column', 'id': 'column-adder', 'title': 'Add New Column...'})      
        var columnTitleDOM = $('<div/>', {'class': 'column-title', 'innerText': 'Add New Column...'});
      
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
            var taskTitleDOM = $('<div/>', { 'class': 'task-title', 'innerText': task.title });            
            var taskCloseDOM = $('<i/>', {'class': 'fa fa-times'});
            taskOwnerDOM.append(taskDOM);
            taskDOM.append(taskCloseDOM);
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

    $('.task, .task-adder').bind('click', function(event) {
        
        var task = event.target;
        if(task.className === "fa fa-times")
        {
            return;          
        }        
        if(task.className === "fa fa-plus-circle")
        {
            task = task.parentElement;            
        }        
        if(task.className === "task-title" || task.className === "plus" || task.className === "column-title")
        {
            task = task.parentElement;
        }
        
        $("#updateTaskForm" ).show();
        $('#old-title').val(task.getAttribute('id'));
        $('#updated-title').val(task.title);
        $("#updateColumnForm" ).hide();
    });
    
    $('.column, .column-adder').bind('click', function(event) {
         
        var column = event.target;
        if(column.className === "fa fa-times")
        {
            return;          
        }        
        if(column.className === "fa fa-plus-circle")
        {
            column = column.parentElement;            
        }        
        if(column.className === "plus" || column.className === "column-title")
        {
            column = column.parentElement;
        }
        if(column.className === "column")
        {
            $("#updateColumnForm" ).show().focus();
            $('#old-column-title').val(column.getAttribute('id'));
            $('#updated-column-title').val(column.title);
            $( "#updateTaskForm" ).hide();
        }
        
    });
    
    $('.fa-times').bind('click', function(event) {
        
        var toBeDeleted = event.target;
        if(toBeDeleted.className === "fa fa-times")
        {
            toBeDeleted = toBeDeleted.parentElement;            
        }      
        var success = false;
        if(toBeDeleted.className === "task")
        {
            success = DeleteTaskInJsObject(toBeDeleted);
        }
        else if(toBeDeleted.className === "column")
        {
            success = DeleteColumnInJsObject(toBeDeleted);
        }
        if(success == true)
        {  
            var toBeDeletedId = toBeDeleted.getAttribute('id');
            $('#'+toBeDeletedId).hide();
        }
    });

    // bind the dragover event on the board sections
    $('.column').bind('dragover', function(event) {
        event.preventDefault();
    });

    // bind the drop event on the board sections
    //DROP IS GOING WITHIN CARD TITLE!!??
    $('.column').bind('drop', function(event) {
        //get the new holder and task
        var newHolder = event.target;
        var taskId = event.originalEvent.dataTransfer.getData("text/plain"); //can only be task
        var task = document.getElementById(taskId);
        
        if(newHolder.className === "task-title" || newHolder.className === "column-title")
        {
            newHolder = event.target.parentElement;
        }
        
        if(newHolder != task) //dont do anything if the object hasnt moved
        {
            MoveTaskInJsObject(newHolder, task);
            console.log('current json');
            console.log(JSON.stringify(board));
            //update the DOM (must be done after)
            newHolder.appendChild(task);        
        }
        
             
        
        // Turn off the default behaviour
        // without this, FF will try and go to a URL with your id's name
        event.preventDefault();
    });
    
    function MoveTaskInJsObject(newHolder, task)
    {
        var oldTaskHolderTitle = task.parentElement.title;//could be task or column
        var newTaskHolderTitle = newHolder.title;//could be task or column
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
    
    function DeleteTaskInJsObject(task)
    {
        var oldTaskHolderTitle = task.parentElement.title;//could be task or column
        var taskTitle = task.title;
        
        var oldTaskHolderObj = searchForProperty(board, oldTaskHolderTitle);
        var taskObj = searchForProperty(oldTaskHolderObj, taskTitle);
        if(typeof taskObj.tasks !== 'undefined' && taskObj.tasks.length > 0)
        {
            return false;
        }
        var index = oldTaskHolderObj.tasks.indexOf(taskObj);
        oldTaskHolderObj.tasks.splice(index, 1);
        return true;
    }

    function DeleteColumnInJsObject(column)
    {
        var columnTitle = column.title;
        var columnObj = searchForProperty(board, columnTitle);
        
        if(typeof columnObj.tasks !== 'undefined' && columnObj.tasks.length > 0)
        {
            return false;
        }
        var index = board.columns.indexOf(columnObj);
        board.columns.splice(index, 1);
        return true;
    }
    
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
        var existingTask = searchForProperty(board, newTaskTitle);
        if(existingTask != null)
        {
        }
        else if(taskObj == null)
        {
            if((typeof board.columns[0].tasks  === 'undefined'))
            {
                board.columns[0].tasks = [];
            }
            var tasks = board.columns[0].tasks;
            
            var newTask = {'title': newTaskTitle};
            tasks.push(newTask);
                        
            var taskDOM = $('<div/>', { 'class': 'task', 'id': elementId++, 'draggable': 'true', 'title': newTaskTitle})
            var taskTitleDOM = $('<div/>', { 'class': 'task-title', 'innerText': newTaskTitle });          
            var taskCloseDOM = $('<i/>', {'class': 'fa fa-times'}); 
            taskDOM.append(taskCloseDOM);  
            taskDOM.append(taskTitleDOM);
            $( "#task-adder" ).before(taskDOM);      
            $( "#updateTaskForm" ).hide();
            setupBindings();//added a new task so need to refresh the bindings
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
    
    
    $("#updateColumnForm").submit(function(e) {       
               
        var columnId = $('#old-column-title').val();
        var newColumnTitle = $('#updated-column-title').val();
        var titleDOM = document.getElementById(columnId);
        
        var columnObj = searchForProperty(board, titleDOM.title);
        var existingColumn = searchForProperty(board, newColumnTitle);
        if(existingColumn != null)
        {
        }
        else if(columnObj == null)
        {
            var columns = board.columns;
            
            var newColumn = {'title': newColumnTitle};
            columns.push(newColumn);
                        
                        

            
            var columnDOM = $('<div/>', {'class': 'column', 'id': elementId++, 'title': newColumnTitle})      
            var columnTitleDOM = $('<div/>', {'class': 'column-title', 'innerText': newColumnTitle});
            var columnCloseDOM = $('<i/>', {'class': 'fa fa-times'});
            
            columnDOM.append(columnCloseDOM);
            columnDOM.append(columnTitleDOM);
            $( "#column-adder" ).before(columnDOM);      
            $( "#updateColumnForm" ).hide();
            
            setupBindings();//added a new column so need to refresh the bindings
        }
        else
        {
            columnObj.title = newColumnTitle;
            titleDOM.title = newColumnTitle;
        }

        
        e.preventDefault(); // avoid to execute the actual submit of the form.
        
    });



    



}