/**
 *  Divergence (a Sokoban (or Sokouban if you're a purist) clone)
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
    
    const LEVELS = `###\n#.#\n#$#\n# ####\n#@ * #\n# ####\n#$#\n#.#\n###\n,\n      #####\n      #   #\n####### # #\n#         #\n# # ##### #\n#   #   # #\n### #   # #\n  #$#   # #\n  # #   # #\n  #@#   #.#\n  ###   ###\n,\n      #####\n      #   #\n####### #$#\n# $       #\n# # ##### #\n#   #   # #\n### #   # #\n  #$#   #.#\n  # #   #.#\n  #@#   #.#\n  ###   ###\n,\n    #####\n    #   #\n    #$  #\n  ###  $##\n  #  $ $ #\n### # ## #   ######\n#   # ## #####  ..#\n# $  $          ..#\n##### ### #@##  ..#\n   ##     #########\n   ########,`
    
    const levels = [];
    
    if(!initLevels()) return;
    
    const context = document.getElementById("board").getContext("2d");
    document.getElementById("board").width = window.innerWidth;
    document.getElementById("board").height = window.innerHeight;
    
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;
    
    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;
    
    var cellSize = null;
    var xp = null;
    var yp = null;
    
    var currentLevel =
    {
        'width': null,
        'height': null,
        'player': null,
        'goals': null,
        'map': null
    };
    
    var complete = false;
    
    // Load a level.
    var curLevel = 0;
    loadLevel(levels[curLevel]);
    
    // Draw initial state.
    draw();

    document.onkeydown = e =>
    {   
        const dir = e.keyCode;
        switch(dir)
        {
            case LEFT:
            case UP:
            case RIGHT:
            case DOWN:
                if(!complete && update(dir))
                {
                    complete = true;
                    
                    context.fillStyle = "black";
                    context.fillRect(0, 0, WIDTH, HEIGHT);
                    
                    context.fillStyle = "white";
                    context.font = "bold 30pt Courier New";
                    context.fillText("Completed", WIDTH / 2 - context.measureText("Completed").width/ 2, HEIGHT / 2);
                    
                    context.font = "bold 12pt Courier New";
                    if(curLevel != levels.length - 1)
                    {
                        const t = "Press ENTER to go to the next level.";
                        context.fillText(t, WIDTH / 2 - context.measureText(t).width / 2, HEIGHT / 2 + 100);
                    }
                    else
                    {
                        const t = "You have completed all the levels. Congratulations!";
                        context.fillText(t, WIDTH / 2 - context.measureText(t).width / 2, HEIGHT / 2 + 100);
                    }
                }
                break;
                
            case 82: // Restart level.
                loadLevel(levels[curLevel]);
                draw();
                break
                
            case 13: // Load next level.
                if(complete && curLevel != levels.length - 1)
                {
                    loadLevel(levels[++curLevel]);
                    draw();
                }
        }
    };
    
    function update(direction)
    {
        const dest = move(direction, currentLevel.player);
        if(currentLevel.map[dest.y][dest.x].type != "wall")
        {
            // If the player moves into a box, we try to push that box.
            if(currentLevel.map[dest.y][dest.x].hasBox && moveBox(direction, dest))
            {
                currentLevel.player = dest;
                draw();
                
                // Check if the level has been completed.
                if(currentLevel.goals == 0) return true;
            }
            else if(!currentLevel.map[dest.y][dest.x].hasBox)
            {
                currentLevel.player = dest;
                draw();
            }
        }
        
        return false;
    }
    
    function moveBox(direction, src)
    {
        // We move the box if the destination does not
        // contain a wall or another box.
        const dest = move(direction, src);
        if(currentLevel.map[dest.y][dest.x].type != "wall" && !currentLevel.map[dest.y][dest.x].hasBox)
        {
            currentLevel.map[src.y][src.x].hasBox = false;
            currentLevel.map[dest.y][dest.x].hasBox = true;

            // Increment remaining goals if the box was pushed off a goal.
            if(currentLevel.map[src.y][src.x].isGoal) currentLevel.goals++;

            // Decrement remaining goals if the box was pushed onto a goal.
            if(currentLevel.map[dest.y][dest.x].isGoal) currentLevel.goals--;
                
            return true;
        }
        
        return false;
    }
    
    function move(direction, coord)
    {
        switch(direction)
        {
            case LEFT: return {'x': coord.x - 1, 'y': coord.y};
            case UP: return {'x': coord.x, 'y': coord.y - 1};
            case RIGHT: return {'x': coord.x + 1, 'y': coord.y};
            case DOWN: return {'x': coord.x, 'y': coord.y + 1};
        }
    }
    
    function initLevels()
    {
        // Load definition strings of Divergence
        // levels from the level file.
        var level = [];
        for(const line of LEVELS.split(/\r\n|\r|\n/))
        {
            if(line == ",")
            {
                levels.push(level.join("|"));
                level = [];
            }
            else
            {
                level.push(line);
            }
        }

        return true;
    }
    
    function loadLevel(def)
    {
        currentLevel.goals = 0;
        currentLevel.map = [[]];
        
        var x = 0, width = 0, height = 0;
        for(var i = 0; i < def.length; i++)
        {
            switch(def[i])
            {
                case '.': // Goal.
                    currentLevel.map[height].push({'type': "floor", 'isGoal': true, 'hasBox': false});
                    currentLevel.goals++;
                    break;
                    
                case '$': // Box.
                    currentLevel.map[height].push({'type': "floor", 'isGoal': false, 'hasBox': true});
                    break;
                    
                case '*': // Box over goal.
                    currentLevel.map[height].push({'type': "floor", 'isGoal': true, 'hasBox': true});
                    break;
                    
                case '#': // Wall.
                    currentLevel.map[height].push({'type': "wall"});
                    break;
                    
                case '@': // Player.
                    currentLevel.player = {'x': x, 'y': height};
                    currentLevel.map[height].push({'type': "floor", 'isGoal': false, 'hasBox': false});                    
                    break;
                    
                case '&': // Player over a goal.
                    currentLevel.player = {'x': x, 'y': height};
                    currentLevel.map[height].push({'type': "floor", 'isGoal': true, 'hasBox': false});
                    currentLevel.goals++;
                    break;
                    
                case '|': // Start a new row.
                    height++;
                    if(x > width) width = x;

                    x = -1;
                    currentLevel.map.push([]);
                    break;
                    
                default: // Floor.
                    currentLevel.map[height].push({'type': "floor", 'isGoal': false, 'hasBox': false});
            }
            
            x++;
        }
        
        currentLevel.width = width;
        currentLevel.height = ++height;
        
        // Determine cellSize based on level and window dimensions.
        // Allows the drawn map to scale to the window size.
        cellSize = parseInt(Math.min(WIDTH / width, HEIGHT / height));

        // Determine x and y padding, which are
        // used to centre the level within the window.
        xp = parseInt((WIDTH - (cellSize * width)) / 2);
        yp = parseInt((HEIGHT - (cellSize * height)) / 2);
        
        complete = false;
    }
    
    function draw()
    {
        context.fillStyle = "black";
        context.fillRect(0, 0, WIDTH, HEIGHT);
        
        const half = cellSize / 4;
        for(var y = 0; y < currentLevel.height; y++)
        {
            for(var x = 0; x < currentLevel.map[y].length; x++)
            {
                var cell = currentLevel.map[y][x];
                if(cell.type == "floor")
                {
                    if(cell.hasBox)
                    {
                        // If a box is on a goal, draw it in green
                        // to differentiate it from other boxes.
                        cell.isGoal && cell.hasBox ? context.fillStyle = "lime" : context.fillStyle = "red";
                        
                        context.fillRect(x * cellSize + xp, y * cellSize + yp, cellSize - 1, cellSize - 1);
                    }
                    else if(cell.isGoal)
                    {
                        context.fillStyle = "red";
                        context.fillRect(x * cellSize + xp + half, y * cellSize + yp + half, cellSize - half * 2, cellSize - half * 2);
                    }
                }
                else
                {
                    context.fillStyle = "white";
                    context.fillRect(x * cellSize + xp, y * cellSize + yp, cellSize - 1, cellSize - 1);
                }
            }
        }
        
        context.fillStyle = "blue";
        context.fillRect(currentLevel.player.x * cellSize + xp, currentLevel.player.y * cellSize + yp, cellSize - 1, cellSize - 1);
    }
}
