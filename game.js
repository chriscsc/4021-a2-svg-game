// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}

// :'######:::'#######::'##::: ##::'######::'########:
// '##... ##:'##.... ##: ###:: ##:'##... ##:... ##..::
//  ##:::..:: ##:::: ##: ####: ##: ##:::..::::: ##::::
//  ##::::::: ##:::: ##: ## ## ##:. ######::::: ##::::
//  ##::::::: ##:::: ##: ##. ####::..... ##:::: ##::::
//  ##::: ##: ##:::: ##: ##:. ###:'##::: ##:::: ##::::
// . ######::. #######:: ##::. ##:. ######::::: ##::::
// :......::::.......:::..::::..:::......::::::..:::::

//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 0);     // The initial position of the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game



// '##::::'##::::'###::::'########::
//  ##:::: ##:::'## ##::: ##.... ##:
//  ##:::: ##::'##:. ##:: ##:::: ##:
//  ##:::: ##:'##:::. ##: ########::
// . ##:: ##:: #########: ##.. ##:::
// :. ## ##::: ##.... ##: ##::. ##::
// ::. ###:::: ##:::: ##: ##:::. ##:
// :::...:::::..:::::..::..:::::..::
//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum

var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var zoom = 1.0;                             // The zoom level of the screen

var MONSTER_SIZE = new Size(40 , 40);
var SWEET_SIZE = new Size(40,40);

var BULLET_SIZE = new Size(10, 10); // The size of a bullet
var BULLET_SPEED = 10.0;            // The speed of a bullet
                                    //  = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0;         // The period when shooting is disabled
var canShoot = true;                // A flag indicating whether the player can shoot a bullet

var FACE_LEFT = false;                  //direction player face


var bullet_remain = 8;


var canHit = true;
var name;
var cheatmode = false;
var TimeInterval;

var gameclear;

// '########::'##::::::::::'###::::'##:::'##:'########:'########::
//  ##.... ##: ##:::::::::'## ##:::. ##:'##:: ##.....:: ##.... ##:
//  ##:::: ##: ##::::::::'##:. ##:::. ####::: ##::::::: ##:::: ##:
//  ########:: ##:::::::'##:::. ##:::. ##:::: ######::: ########::
//  ##.....::: ##::::::: #########:::: ##:::: ##...:::: ##.. ##:::
//  ##:::::::: ##::::::: ##.... ##:::: ##:::: ##::::::: ##::. ##::
//  ##:::::::: ########: ##:::: ##:::: ##:::: ########: ##:::. ##:
// ..:::::::::........::..:::::..:::::..:::::........::..:::::..::

// The player class used in this program
function Player() {
    this.node = svgdoc.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.size = PLAYER_SIZE;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
}

Player.prototype.isOnPlatform = function() {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect" ) continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
            ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
            (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) return true;
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.collidePlatform = function(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
}

Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}




// '##::::'##::'#######::'##::: ##::'######::'########:'########:'########::
//  ###::'###:'##.... ##: ###:: ##:'##... ##:... ##..:: ##.....:: ##.... ##:
//  ####'####: ##:::: ##: ####: ##: ##:::..::::: ##:::: ##::::::: ##:::: ##:
//  ## ### ##: ##:::: ##: ## ## ##:. ######::::: ##:::: ######::: ########::
//  ##. #: ##: ##:::: ##: ##. ####::..... ##:::: ##:::: ##...:::: ##.. ##:::
//  ##:.:: ##: ##:::: ##: ##:. ###:'##::: ##:::: ##:::: ##::::::: ##::. ##::
//  ##:::: ##:. #######:: ##::. ##:. ######::::: ##:::: ########: ##:::. ##:
// ..:::::..:::.......:::..::::..:::......::::::..:::::........::..:::::..::

// The Monster class used in this program
function Monster() {
    // this.node = svgdoc.getElementById("monster");
    // this.position = MONSTER_INIT_POS;
    // this.size = MONSTER_SIZE;
    // this.motion = motionType.NONE;
    // this.verticalSpeed = 0;

    var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");


    var MONSTER_INIT_POS = new Point(Math.floor(Math.random()*500+50), Math.floor(Math.random()*500)+10);
    while(intersect( MONSTER_INIT_POS, new Size(120,120), player.position, PLAYER_SIZE))
        MONSTER_INIT_POS = new Point(Math.floor(Math.random()*500+50), Math.floor(Math.random()*500)+10);

    monster.setAttribute("x", MONSTER_INIT_POS.x);
    monster.setAttribute("y", MONSTER_INIT_POS.y);

    var MONSTER_DEST_POS = new Point(Math.floor(Math.random()*500+50), Math.floor(Math.random()*500)+10);
    while(intersect( MONSTER_INIT_POS, new Size(120,120), player.position, PLAYER_SIZE))
        MONSTER_DEST_POS = new Point(Math.floor(Math.random()*500+50), Math.floor(Math.random()*500)+10);

    monster.setAttribute("Dx", MONSTER_DEST_POS.x);
    monster.setAttribute("Dy", MONSTER_DEST_POS.y);
    // console.log(MONSTER_DEST_POS.x);
    // console.log(MONSTER_DEST_POS.y);
    monster.setAttribute("turn",MONSTER_DEST_POS.x - MONSTER_INIT_POS.x >0? 1:0);
    monster.setAttribute("faceLeft", MONSTER_DEST_POS.x - MONSTER_INIT_POS.x <0? 1:0);

    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    svgdoc.getElementById("monsters").appendChild(monster);

}

Monster.prototype.isOnPlatform = function() {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect" ) continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + MONSTER_SIZE.w > x && this.position.x < x + w) ||
            ((this.position.x + MONSTER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
            (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + MONSTER_SIZE.h == y) return true;
    }
    if (this.position.y + MONSTER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Monster.prototype.collidePlatform = function(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, MONSTER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, MONSTER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - MONSTER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
}

Monster.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + MONSTER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - MONSTER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + MONSTER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - MONSTER_SIZE.h;
        this.verticalSpeed = 0;
    }
}






// '####:'##::: ##:'####:'########:'####::::'###::::'##:::::::'####:'########::::'###::::'########:'####::'#######::'##::: ##:
// . ##:: ###:: ##:. ##::... ##..::. ##::::'## ##::: ##:::::::. ##::..... ##::::'## ##:::... ##..::. ##::'##.... ##: ###:: ##:
// : ##:: ####: ##:: ##::::: ##::::: ##:::'##:. ##:: ##:::::::: ##:::::: ##::::'##:. ##::::: ##::::: ##:: ##:::: ##: ####: ##:
// : ##:: ## ## ##:: ##::::: ##::::: ##::'##:::. ##: ##:::::::: ##::::: ##::::'##:::. ##:::: ##::::: ##:: ##:::: ##: ## ## ##:
// : ##:: ##. ####:: ##::::: ##::::: ##:: #########: ##:::::::: ##:::: ##::::: #########:::: ##::::: ##:: ##:::: ##: ##. ####:
// : ##:: ##:. ###:: ##::::: ##::::: ##:: ##.... ##: ##:::::::: ##::: ##:::::: ##.... ##:::: ##::::: ##:: ##:::: ##: ##:. ###:
// '####: ##::. ##:'####:::: ##::::'####: ##:::: ##: ########:'####: ########: ##:::: ##:::: ##::::'####:. #######:: ##::. ##:
// ....::..::::..::....:::::..:::::....::..:::::..::........::....::........::..:::::..:::::..:::::....:::.......:::..::::..::
//
// The load function for the SVG document
//
function load(evt) {
	// Set the root node to the global variable
   	svgdoc = evt.target.ownerDocument;
}

function Input(){
	name = prompt("Enter your name ");
	if(name.length == 0)
		name = "Anonymous";
	ready();
}

function ready(){
        var gameArea = svgdoc.getElementById("game");
        gameArea.style.setProperty("visibility", "visible", null);
		svgdoc.getElementById("HPRemain").firstChild.data = 2;
		svgdoc.getElementById("bulletRemain").firstChild.data = 8;
		svgdoc.getElementById("score").firstChild.data = 0;
		svgdoc.getElementById("Level").firstChild.data = 1;
		svgdoc.getElementById("TimeRemain").firstChild.data = 1;



		var platforms = svgdoc.getElementById("platforms");

		// Create a new rect element
		var newPlatform1 = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");

		// Set the various attributes of the line
		newPlatform1.setAttribute("x", 420);
		newPlatform1.setAttribute("y", 360);
		newPlatform1.setAttribute("width", 40);
		newPlatform1.setAttribute("height", 20);
		newPlatform1.setAttribute("type", "disappearing");
		newPlatform1.style.setProperty("opacity", 1, null);
		//newPlatform1.setAttribute("style", "fill:rgb(64,255,64);stroke:rgb(0,0,0);stroke-width:1");
		newPlatform1.setAttribute("rx", 5.79165 );
		newPlatform1.setAttribute("ry", 5.79165 );

		// Add the new platform to the end of the group
		platforms.appendChild(newPlatform1);

		// Create a new rect element
		var newPlatform2 = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");

		// Set the various attributes of the line
		newPlatform2.setAttribute("x", 400);
		newPlatform2.setAttribute("y", 120);
		newPlatform2.setAttribute("width", 40);
		newPlatform2.setAttribute("height", 20);
		newPlatform2.setAttribute("type", "disappearing");
		newPlatform2.style.setProperty("opacity", 1, null);
		//newPlatform2.setAttribute("style", "fill:rgb(64,255,64);stroke:rgb(0,0,0);stroke-width:1");
		newPlatform2.setAttribute("rx", 5.79165 );
		newPlatform2.setAttribute("ry", 5.79165 );

		// Add the new platform to the end of the group
		platforms.appendChild(newPlatform2);

		// Create a new rect element
		var newPlatform3 = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");

		// Set the various attributes of the line
		newPlatform3.setAttribute("x", 140);
		newPlatform3.setAttribute("y", 360);
		newPlatform3.setAttribute("width", 40);
		newPlatform3.setAttribute("height", 20);
		newPlatform3.setAttribute("type", "disappearing");
		newPlatform3.style.setProperty("opacity", 1, null);
		//newPlatform3.setAttribute("style", "fill:rgb(64,255,64);stroke:rgb(0,0,0);stroke-width:1");
		newPlatform3.setAttribute("rx", 5.79165 );
		newPlatform3.setAttribute("ry", 5.79165 );

		// Add the new platform to the end of the group
		platforms.appendChild(newPlatform3);

		startgame();
}

function newLevel(){
    var bullets = svgdoc.getElementById("bullets");
    while(bullets.childNodes.length > 0) {
        bullets.removeChild(bullets.firstChild);
    }

    var monsters = svgdoc.getElementById("monsters");
        while(monsters.childNodes.length > 0){
        monsters.removeChild(monsters.firstChild);
    }

    var temp = parseInt(svgdoc.getElementById("score").firstChild.data);
    temp += parseInt(svgdoc.getElementById("Level").firstChild.data) * 100 * zoom + parseInt(svgdoc.getElementById("TimeRemain").firstChild.data) * 5 * zoom;
    svgdoc.getElementById("score").firstChild.data = temp;
    clearInterval(gameInterval)
    clearTimeout(TimeInterval);
    svgdoc.getElementById("Level").firstChild.data = parseInt(svgdoc.getElementById("Level").firstChild.data) + 1;
    startgame();
}

function restart(){
    choosed = false;
    var bullets = svgdoc.getElementById("bullets");
    while(bullets.childNodes.length > 0) {
            bullets.removeChild(bullets.firstChild);
    }
    var monsters = svgdoc.getElementById("monsters");
    while(monsters.childNodes.length > 0){
            monsters.removeChild(monsters.firstChild);
    }
    var sweets = svgdoc.getElementById("sweets");
        while(sweets.childNodes.length > 0){
                sweets.removeChild(sweets.firstChild);
    }
    var node = svgdoc.getElementById("highscoretable");
    node.style.setProperty("visibility", "hidden", null);

    var startPage = svgdoc.getElementById("startpage");
    startPage.style.setProperty("visibility", "visible", null);

    var gameArea = svgdoc.getElementById("game");
    gameArea.style.setProperty("visibility", "hidden", null);


    svgdoc.getElementById("zoom").setAttribute("onclick", "top.zoomMode()");

    var node2 = svgdoc.getElementById("highscoretext");
    while(node2.childNodes.length > 0)
        node2.removeChild(node2.firstChild);
    svgdoc.getElementById("changeAppearance").setAttribute("style", "fill:rgb(255,255,0);stroke:rgb(0,0,0);stroke-width:1")
}

function startgame(){

	// Attach keyboard events
	svgdoc.documentElement.addEventListener("keydown", keydown, false);
	svgdoc.documentElement.addEventListener("keyup", keyup, false);

	// Remove text nodes in the 'platforms' group
	cleanUpGroup("platforms", true);

	// Create the player
	player = new Player();
	for(var i=0; i<8 ; ++i)
		createSweet();
	for(var i=0; i< 2 + parseInt(svgdoc.getElementById("Level").firstChild.data) * 4; ++i)
		createMonster();
	// Start the game interval
	    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);

	TimeInterval = setTimeout("decreaseTime()", 1000);
	gameclear = false;
    svgdoc.getElementById("verticalPlatform-1").setAttribute("speed",2);
    svgdoc.getElementById("verticalPlatform-2").setAttribute("speed",2);
	svgdoc.getElementById("TimeRemain").firstChild.data = 60;
	svgdoc.getElementById("bulletRemain").firstChild.data = 8;
}

function createSweet(){
    var sweet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");

    var SWEET_POS ;
    var find = false;
    var platforms = svgdoc.getElementById("platforms");

        while(!find){
        find = true;
        SWEET_POS = new Point(Math.random()*560, Math.random()*520);
            for (var i = 0; i < platforms.childNodes.length; i++) {
                var node = platforms.childNodes.item(i);
                if (node.nodeName != "rect") continue;

                var x = parseFloat(node.getAttribute("x"));
                var y = parseFloat(node.getAttribute("y"));
                var w = parseFloat(node.getAttribute("width"));
                var h = parseFloat(node.getAttribute("height"));
                var pos = new Point(x, y);
                var size = new Size(w, h);
                if (intersect(SWEET_POS, new Size(40,40), pos, size)) {
                find = false
                break;
                }
            }
    }

    sweet.setAttribute("x", SWEET_POS.x);
    sweet.setAttribute("y", SWEET_POS.y);

    sweet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#sweet");
    svgdoc.getElementById("sweets").appendChild(sweet);
}

function createMonster() {
    var monster = new Monster();
}

function decreaseTime(){
    svgdoc.getElementById("TimeRemain").firstChild.data = parseInt(svgdoc.getElementById("TimeRemain").firstChild.data) -1;
    if(parseInt(svgdoc.getElementById("TimeRemain").firstChild.data) == 0)
        gameover();
    else
        TimeInterval = setTimeout("decreaseTime()",1000);
}

//
// This function removes all/certain nodes under a group
//
function cleanUpGroup(id, textOnly) {
    var node, next;
    var group = svgdoc.getElementById(id);
    node = group.firstChild;
    while (node != null) {
        next = node.nextSibling;
        if (!textOnly || node.nodeType == 3) // A text node
            group.removeChild(node);
        node = next;
    }
}



// '##:::'##:'########:'##:::'##:'########:::'#######:::::'###::::'########::'########::
//  ##::'##:: ##.....::. ##:'##:: ##.... ##:'##.... ##:::'## ##::: ##.... ##: ##.... ##:
//  ##:'##::: ##::::::::. ####::: ##:::: ##: ##:::: ##::'##:. ##:: ##:::: ##: ##:::: ##:
//  #####:::: ######:::::. ##:::: ########:: ##:::: ##:'##:::. ##: ########:: ##:::: ##:
//  ##. ##::: ##...::::::: ##:::: ##.... ##: ##:::: ##: #########: ##.. ##::: ##:::: ##:
//  ##:. ##:: ##:::::::::: ##:::: ##:::: ##: ##:::: ##: ##.... ##: ##::. ##:: ##:::: ##:
//  ##::. ##: ########:::: ##:::: ########::. #######:: ##:::: ##: ##:::. ##: ########::
// ..::::..::........:::::..:::::........::::.......:::..:::::..::..:::::..::........:::
//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "N".charCodeAt(0):
            player.motion = motionType.LEFT;
            break;

        case "M".charCodeAt(0):
            player.motion = motionType.RIGHT;
            break;
        // Add your code here

        case "Z".charCodeAt(0):
            if (player.isOnPlatform()) {
        		player.verticalSpeed = 20;
    		}

            break;
    	case 32: // spacebar = shoot
        	if (canShoot) shootBullet();
            	break;
        case "C".charCodeAt(0):
            cheatmode = true;
            break;
        case "V".charCodeAt(0):
            cheatmode = false;
            break;
    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "N".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "M".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;

    }
}


//
// This function updates the position and motion of the player in the system
//
function gamePlay() {


    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();

    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT){
		FACE_LEFT = true;
        displacement.x = -MOVE_DISPLACEMENT;
	}
    if (player.motion == motionType.RIGHT){
		player.node.setAttribute("transform","translate(" + PLAYER_SIZE.w + ", 0) scale(-1, 1)");
		FACE_LEFT = false;
        displacement.x = MOVE_DISPLACEMENT;
	}
    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

	var platforms = svgdoc.getElementById("platforms");
	if(isOnPlatform && platforms.childNodes.length > 31){
		for (var i = 0; i < platforms.childNodes.length; i++) {
        	var node = platforms.childNodes.item(i);
			if (node.nodeName != "rect" ) continue;
			if (node.getAttribute("type") == "disappearing") {
				if(parseInt(node.getAttribute("y")) == player.position.y + PLAYER_SIZE.h
					&& player.position.x + PLAYER_SIZE.w > parseInt(node.getAttribute("x"))
					&& player.position.x < parseInt(node.getAttribute("x")) + parseInt(node.getAttribute("width"))){
					node.style.setProperty("opacity",  parseFloat(node.style.getPropertyValue("opacity")) - 0.1 , null);
					if( parseFloat(node.style.getPropertyValue("opacity"))== 0.0)
							 platforms.removeChild(node);
				}
			}
		}
	}


    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;
    moveBullets();
    moveMonsters()
    collisionDetection();
    updateScreen();
}

function zoomMode(){
	zoom = 2.0;
	choosed = true;
	Input();
}

function normalMode(){
	zoom = 1.0;
	choosed = true;
	Input();
}



// :'######::::::'###::::'##::::'##:'########::::'########::'##::::::::::'###::::'##:::'##:
// '##... ##::::'## ##::: ###::'###: ##.....::::: ##.... ##: ##:::::::::'## ##:::. ##:'##::
//  ##:::..::::'##:. ##:: ####'####: ##:::::::::: ##:::: ##: ##::::::::'##:. ##:::. ####:::
//  ##::'####:'##:::. ##: ## ### ##: ######:::::: ########:: ##:::::::'##:::. ##:::. ##::::
//  ##::: ##:: #########: ##. #: ##: ##...::::::: ##.....::: ##::::::: #########:::: ##::::
//  ##::: ##:: ##.... ##: ##:.:: ##: ##:::::::::: ##:::::::: ##::::::: ##.... ##:::: ##::::
// . ######::: ##:::: ##: ##:::: ##: ########:::: ##:::::::: ########: ##:::: ##:::: ##::::
// :......::::..:::::..::..:::::..::........:::::..:::::::::........::..:::::..:::::..:::::


//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//

function moveVerticalBar(verticalBar) {
    if(parseInt(verticalBar.getAttribute("y")) == 400 )
    verticalBar.setAttribute("speed", -2 );
    else if(parseInt(verticalBar.getAttribute("y")) == 140)
    verticalBar.setAttribute("speed", 2 );


    var verticalBarSpeed = parseInt(verticalBar.getAttribute("speed"));

    if(parseInt(verticalBar.getAttribute("y")) == player.position.y + PLAYER_SIZE.h
        && player.position.x + PLAYER_SIZE.w > parseInt(verticalBar.getAttribute("x"))
        && player.position.x < parseInt(verticalBar.getAttribute("x")) + parseInt(verticalBar.getAttribute("width")) )
    {
        player.position.y += verticalBarSpeed;
    }

    // Transform the player
    player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
    verticalBar.setAttribute("y", parseInt(verticalBar.getAttribute("speed")) + parseInt(verticalBar.getAttribute("y")) );
}
function updateScreen() {

    moveVerticalBar(svgdoc.getElementById("verticalPlatform-1"));
    moveVerticalBar(svgdoc.getElementById("verticalPlatform-2"));

    if(FACE_LEFT){
    	player.node.setAttribute("transform","translate(" + (player.position.x + PLAYER_SIZE.w)  + "," + player.position.y + ") scale(-1, 1)");
    }

    if(parseInt(svgdoc.getElementById("HPRemain").firstChild.data) ==1){
    	svgdoc.getElementById("changeAppearance").setAttribute("style", "fill:rgb(255,0,0);stroke:rgb(0,0,0);stroke-width:1");
    }

    svgdoc.getElementById("nameBar").firstChild.data = name;
    svgdoc.getElementById("nameBar").setAttribute("x", player.position.x + PLAYER_SIZE.w/2);
    svgdoc.getElementById("nameBar").setAttribute("y", player.position.y - PLAYER_SIZE.h/2 );


 	var monsters = svgdoc.getElementById("monsters");
	for (var i = 0; i < svgdoc.getElementById("monsters").childNodes.length; i++) {
		var node = monsters.childNodes.item(i);
		if(node.getAttribute("turn")){
			if(parseInt(node.getAttribute("faceLeft"))){
				var temp_x = parseInt(node.getAttribute("x"));
				var temp_y = parseInt(node.getAttribute("y"));
				node.setAttribute("transform","translate(" + (2*temp_x + 40 )  + "," + 0 + ") scale(-1, 1)");
			}
			else
				node.setAttribute("transform","");
			node.setAttribute("turn",false);
		}
	}

	if(intersect( new Point(560,20) , new Size(40,40) , player.position, PLAYER_SIZE))
		if(gameclear)
			newLevel();

	//else
	//	player.node.setAttribute("transform"," ");
    // Calculate the scaling and translation factors

    // Add your code here


    if(zoom >1.0){
     	sx = zoom;

    	sy = zoom;


    	var cx = player.position.x + PLAYER_SIZE.w/2;
    	var cy = player.position.y + PLAYER_SIZE.h/2;
    	var tx = SCREEN_SIZE.w/zoom/2;
    	var ty = SCREEN_SIZE.h/zoom/2;

    	if(cx < SCREEN_SIZE.w/zoom/2)
    		tx = cx;
    	if(cy < SCREEN_SIZE.h/zoom/2)
    		ty = cy;
    	if(cx > SCREEN_SIZE.w - SCREEN_SIZE.w/zoom/2)
    		tx = 2 * SCREEN_SIZE.w/zoom/2 - (SCREEN_SIZE.w- cx );
    	if(cy > SCREEN_SIZE.h - SCREEN_SIZE.h/zoom/2)
    		ty = 2 * SCREEN_SIZE.h/zoom/2 - (SCREEN_SIZE.h- cy );


    	svgdoc.getElementById("gamearea").setAttribute("transform", " translate(" + zoom * tx + ", " + zoom * ty + ") scale(" + sx + "," + sy + ") translate(" + -cx+ ", " + -cy + ")");
    }
	else {
		svgdoc.getElementById("gamearea").setAttribute("transform", "");
    }
}

function moveMonsters(){

    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        node = monsters.childNodes.item(i);
		node.setAttribute("turn", false);
        x = parseInt(node.getAttribute("x"));
        dx = parseInt(node.getAttribute("Dx"));
        y = parseInt(node.getAttribute("y"));
        dy = parseInt(node.getAttribute("Dy"));
		if( x == dx && y  == dy ){
			var MONSTER_DEST_POS = new Point(Math.floor(Math.random()*500+50), Math.floor(Math.random()*500)+10);
			node.setAttribute("Dx", MONSTER_DEST_POS.x);
			node.setAttribute("Dy", MONSTER_DEST_POS.y);

			var check = MONSTER_DEST_POS.x - x <0? 1:0;
			if(check != parseInt(node.getAttribute("faceLeft"))){
				node.setAttribute("turn", true);
				node.setAttribute("faceLeft",check);
			}
		}
		else if( x == dx && y != dy ){
			var y_displacement = 1;
			if(y > dy )
				y_displacement *= -1;
			node.setAttribute("y", y + y_displacement);
		}
		else if( x != dx && y  == dy ){
			var x_displacement = 1;
			if(parseInt(node.getAttribute("faceLeft")))
				x_displacement *= -1;
			node.setAttribute("x", x + x_displacement);
		}
		else{
			var y_displacement = 1;
			if(y > dy)
				y_displacement *= -1;
			node.setAttribute("y", y + y_displacement);

			var x_displacement = 1;
			if(parseInt(node.getAttribute("faceLeft")))
				x_displacement *= -1;
			node.setAttribute("x", x + x_displacement);

			// console.log(parseInt(node.getAttribute("x")));
			// console.log(parseInt(node.getAttribute("y")));
		}
        x = parseInt(node.getAttribute("x"));
        y = parseInt(node.getAttribute("y"));

	}
}

function shootBullet() {

    if(parseInt(svgdoc.getElementById("bulletRemain").firstChild.data)>0 || cheatmode){
        // Disable shooting for a short period of time
        canShoot = false;
        setTimeout("canShoot = true", SHOOT_INTERVAL);

        // Create the bullet by createing a use node
        var bullet= svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");

        // Calculate and set the position of the bullet
        bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w/2 );
        bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h/2 );
        bullet.setAttribute("speed",FACE_LEFT? -10:10);
        // Set the href of the use node to the bullet defined in the defs node
        bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");

        // Append the bullet to the bullet group
        svgdoc.getElementById("bullets").appendChild(bullet);

        if(!cheatmode){
        	var temp = parseInt(svgdoc.getElementById("bulletRemain").firstChild.data) - 1;
        	svgdoc.getElementById("bulletRemain").firstChild.data = temp;
        }
    }
}

function moveBullets() {
    // Go through all bullets
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);

        // Update the position of the bullet

	node.setAttribute("x", parseInt(node.getAttribute("x")) + parseInt(node.getAttribute("speed")));


        // If the bullet is not inside the screen delete it from the group
        if(parseInt(node.getAttribute("x")) > SCREEN_SIZE.w || parseInt(node.getAttribute("x")) < 0)
			node.parentNode.removeChild(node);

    }
}

function collisionDetection() {
    // Check whether the player collides with a monster
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);

        // For each monster check if it overlaps with the player
        // if yes, stop the game
        var x = parseInt(monster.getAttribute("x"));
        var y = parseInt(monster.getAttribute("y"));



	    if (intersect(new Point(x,y), MONSTER_SIZE, player.position, PLAYER_SIZE) && canHit && !cheatmode) {

			var temp = parseInt(svgdoc.getElementById("HPRemain").firstChild.data) -1;
			svgdoc.getElementById("HPRemain").firstChild.data = temp;

			canHit = false;

			setTimeout("canHit = true", 500);


	        if(temp == 0 ){
				gameover();
            }
		}

    }

    // Check whether a bullet hits a monster
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);

		var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));
        // For each bullet check if it overlaps with any monster
        // if yes, remove both the monster and the bullet

        for (var j = 0; j < monsters.childNodes.length; j++) {
    		var monster = monsters.childNodes.item(j);

    		var mx = parseInt(monster.getAttribute("x"));
    		var my = parseInt(monster.getAttribute("y"));


    		if (intersect(new Point(mx,my), MONSTER_SIZE, new Point(x,y), BULLET_SIZE )) {
    			bullet.parentNode.removeChild(bullet);
    			monster.parentNode.removeChild(monster);

    		}
    	}
    }
    //Check whether a sweet is eated
    var sweets = svgdoc.getElementById("sweets");
        for (var i = 0; i < sweets.childNodes.length; i++) {
        var sweet = sweets.childNodes.item(i);

        // For each monster check if it overlaps with the player
        // if yes, stop the game
        var x = parseInt(sweet.getAttribute("x"));
        var y = parseInt(sweet.getAttribute("y"));

        if (intersect(new Point(x,y), SWEET_SIZE, player.position, PLAYER_SIZE) ) {
            var temp = parseInt(svgdoc.getElementById("score").firstChild.data);
            temp += 5 * zoom;
            svgdoc.getElementById("score").firstChild.data = temp;
            sweet.parentNode.removeChild(sweet);
        }
    }
	if(sweets.childNodes.length == 0){
		gameclear = true;
	}
}

function gameover(){
    zoom = 1.0;
	clearInterval(gameInterval);
	clearTimeout(TimeInterval);
	var table = getHighScoreTable();
	var record = new ScoreRecord(svgdoc.getElementById("nameBar").firstChild.data, parseInt(svgdoc.getElementById("score").firstChild.data));
	for(var i = 0 ; i < 10 ;++i){
		if(table.length == 0 || i == table.length || table[i].score < record.score   ){
			table.splice(i, 0, record);
			break;
		}
	}

	setHighScoreTable(table);
	showHighScoreTable(table);
}


