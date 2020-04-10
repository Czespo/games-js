/**
 *  Slither (a Snake clone)
 *  Copyright (C) 2020 Czespo
 *  
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *  
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *  
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>
 */

window.onload = () =>
{
    const W_WIDTH = window.innerWidth;
    const W_HEIGHT = window.innerHeight;
    
    const B_WIDTH = 20;
    const B_HEIGHT = 20;
    
    const FPS = parseInt(1000 / 10);
    
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;
    
    const cellSize = Math.min(W_WIDTH / B_WIDTH, W_HEIGHT / B_HEIGHT);
    
    const context = document.getElementById("board").getContext("2d");
    
    var direction = RIGHT;
    var length = 3;
    var body = [];
    
    // Initialise food position.
    var food = {'x': parseInt(Math.random() * B_WIDTH), 'y': parseInt(Math.random() * B_HEIGHT)};
    
    // Initialise snake body.
    for(var i = 0; i < length; i++)
    {
        body.push({'x': 10 - i, 'y': 10});
    }
    
    document.getElementById("board").width = cellSize * B_WIDTH;
    document.getElementById("board").height = cellSize * B_HEIGHT;
    
    document.onkeydown = e =>
    {
        switch(e.keyCode)
        {
            case UP:
            case RIGHT:
            case DOWN:
            case LEFT:
                direction = e.keyCode;
        }
    };
    
    window.setInterval(() =>
    {
        // Move the snake.
        var nx = body[0].x, ny = body[0].y;
        switch(direction)
        {
            case UP:
                ny -= 1;
                break;
                
            case RIGHT:
                nx += 1;
                break;
                
            case DOWN:
                ny += 1;
                break;
                
            case LEFT:
                nx -= 1;
                break;
        }
        
        if(nx >= B_WIDTH)
        {
            nx -= B_WIDTH;
        }
        else if(nx < 0)
        {
            nx += B_WIDTH;
        }
        else if(ny >= B_HEIGHT)
        {
            ny -= B_HEIGHT;
        }
        else if(ny < 0)
        {
            ny += B_HEIGHT;
        }
        
        body = [{'x': nx, 'y': ny}].concat(body.slice(0, -1));
        
        // Check if the snake is eating itself.
        for(var i = 1; i < length; i++)
        {
            if(body[0].x == body[i].x && body[0].y == body[i].y)
            {
                length = 3;
                body = body.slice(0, 3);
            }
        }
        
        // Check if the snake is eating food.
        if(body[0].x == food.x && body[0].y == food.y)
        {
            length++;
            body.push({'x': body[0].x, 'y': body[0].y});
            
            food.x = parseInt(Math.random() * B_WIDTH);
            food.y = parseInt(Math.random() * B_HEIGHT);
        }
        
        // Do drawing.
        context.fillStyle = "black";
        context.fillRect(0, 0, W_WIDTH, W_HEIGHT);
        
        // Draw the snake's head, in dark green.
        context.fillStyle = "green";
        context.fillRect(body[0].x * cellSize, body[0].y * cellSize, cellSize - 1, cellSize - 1);
        
        // Draw the rest of the body, in light green.
        for(var i = 1; i < body.length; i++)
        {
            context.fillStyle = "lime";
            context.fillRect(body[i].x * cellSize, body[i].y * cellSize, cellSize - 1, cellSize - 1);
        }

        // Draw the food.
        context.fillStyle = "red";
        context.fillRect(food.x * cellSize, food.y * cellSize, cellSize - 1, cellSize - 1);
        
    }, FPS);
};
