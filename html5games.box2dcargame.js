//全局对象包含飞车游戏所需要的变量
var carGame = {
	//游戏状态常量
	STATE_STARTING_SCREEN : 1,
	STATE_PLAYING : 2,
	STATE_GAMEOVER_SCREEN : 3,

	state : 1,
	fuel:0,
	fuelMax:0,
	currentLevel:0 
};
var canvas,ctx,canvasWidth,canvasHeight;

$(function(){
	//获取上下文引用
	canvas = document.getElementById('game');
	ctx = canvas.getContext('2d');
	canvasWidth = parseInt(canvas.width);
	canvasHeight = parseInt(canvas.height);

	carGame.levels = new Array();
	carGame.levels[0] = [{"type":"car","x":50,"y":150,"fuel":30},
	{"type":"box","x":250, "y":270, "width":250, "height":25, "rotation":0},
	{"type":"box","x":500,"y":250,"width":65,"height":15,"rotation":-10},
	{"type":"box","x":600,"y":225,"width":80,"height":15,"rotation":-20},
	{"type":"box","x":950,"y":225,"width":80,"height":15,"rotation":20},
	{"type":"box","x":1100,"y":250,"width":100,"height":15,"rotation":0},
	{"type":"win","x":1200,"y":215,"width":15,"height":25,"rotation":0}];

	carGame.levels[1] = [{"type":"car","x":50,"y":310,"fuel":40},
	{"type":"box","x":250, "y":370, "width":250, "height":25, "rotation":0},
	{"type":"box","x":500,"y":350,"width":65,"height":15,"rotation":-10},
	{"type":"box","x":600,"y":325,"width":80,"height":15,"rotation":-20},
	{"type":"box","x":666,"y":285,"width":80,"height":15,"rotation":-32},
	{"type":"box","x":950,"y":225,"width":80,"height":15,"rotation":15},
	{"type":"box","x":1100,"y":250,"width":100,"height":15,"rotation":0},
	{"type":"win","x":1200,"y":215,"width":15,"height":25,"rotation":0}];

	carGame.levels[2] = [{"type":"car","x":50,"y":310,"fuel":50},
	{"type":"box","x":150, "y":370, "width":150, "height":25, "rotation":0},
	{"type":"box","x":300,"y":356,"width":25,"height":15,"rotation":-10},
	{"type":"box","x":500,"y":350,"width":65,"height":15,"rotation":-10},
	{"type":"box","x":600,"y":325,"width":80,"height":15,"rotation":-20},
	{"type":"box","x":666,"y":285,"width":80,"height":15,"rotation":-32},
	{"type":"box","x":950,"y":225,"width":80,"height":15,"rotation":10},
	{"type":"box","x":1100,"y":250,"width":100,"height":15,"rotation":0},
	{"type":"win","x":1200,"y":215,"width":15,"height":25,"rotation":0}];

	carGame.levels[3] = [{"type":"car","x":50,"y":210,"fuel":30},
	{"type":"box","x":100, "y":270, "width":190, "height":15, "rotation":20},
	{"type":"box","x":380, "y":320, "width":100, "height":15, "rotation":-10},
	{"type":"box","x":666,"y":285,"width":80,"height":15,"rotation":-32},
	{"type":"box","x":950,"y":295,"width":80,"height":15,"rotation":20},
	{"type":"box","x":1100,"y":310,"width":100,"height":15,"rotation":0},
	{"type":"win","x":1200,"y":275,"width":15,"height":25,"rotation":0}];

	carGame.levels[4] = [{"type":"car","x":50,"y":210,"fuel":30},
	{"type":"box","x":100, "y":270, "width":190, "height":15, "rotation":20},
	{"type":"box","x":380, "y":320, "width":100, "height":15, "rotation":-10},
	{"type":"box","x":686,"y":285,"width":80,"height":15,"rotation":-32},
	{"type":"box","x":250,"y":495,"width":80,"height":15,"rotation":40},
	{"type":"box","x":500,"y":540,"width":200,"height":15,"rotation":0},
	{"type":"win","x":220,"y":425,"width":15,"height":25,"rotation":23}];


	$('#game').click(function(){
		if(carGame.state == carGame.STATE_STARTING_SCREEN){
			carGame.state = carGame.STATE_PLAYING;
			//创建物理世界及物理模型
			createGameModelByLevel(carGame.currentLevel);
			//开始推进时间步
			step();
		}
	});

	$(document).keydown(function(e){
		/**
		*	ApplyImpulse与ApplyForce的区分
		*	ApplyImpulse 一次性的给物体速度设置到目标值
		*	ApplyForce 给予物体一个力，在力方向做加速度
		**/

		switch(e.keyCode){
			case 39:
				if(carGame.fuel > 0){
					var force = new b2Vec2(5000000,0);
					carGame.car.ApplyForce(force, carGame.car.GetCenterPosition());
					carGame.fuel--;
					$('.fuel-value').width(carGame.fuel/carGame.fuelMax*100 + '%');
				}
				break;
			case 37:
				if(carGame.fuel > 0){
					var force = new b2Vec2(-5000000,0);
					carGame.car.ApplyForce(force, carGame.car.GetCenterPosition());
					carGame.fuel--;
					$('.fuel-value').width(carGame.fuel/carGame.fuelMax*100 + '%');
				}
				break;
			case 38:
				var force = new b2Vec2(0,-10000000);
				carGame.car.ApplyForce(force, carGame.car.GetCenterPosition());
				break;
			case 13:
				createGameModelByLevel(carGame.currentLevel);
				break;
		}
	});

});

var createWorld = function(){
	//设置物理世界的大少
	var worldAABB = new b2AABB();
	worldAABB.minVertex.Set(-4000,-4000);
	worldAABB.maxVertex.Set(4000,4000);

	//定义重力
	var gravity = new b2Vec2(0,300);

	//设置是否忽略休眠对象
	var doSleep = false;
	//最后使用上面定义的对象作为参数来创建Box2d物理世界对象
	var world = new b2World(worldAABB,gravity,doSleep);
	return world;
}

//注意角度是顺时针计算的
var createGround = function(x,y,width,height,rotation,type){
	//定义长方形的形状
	var groundSd = new b2BoxDef();
	groundSd.extents.Set(width,height);	//width,height是实际的一半
	groundSd.restitution = 0.4;		//设置形状的反弹系数
	groundSd.friction = 1;
	if(type == 'win') groundSd.userData = document.getElementById('flag');

	//定义物体，并将它与上面定义的形状进行关联
	var groundBd = new b2BodyDef();
	groundBd.AddShape(groundSd);
	groundBd.position.Set(x,y);
	groundBd.rotation = rotation* Math.PI/180;
	var body = carGame.world.CreateBody(groundBd);

	return body;
}

//创建车身
var createRect = function(world,x,y){
	//创建一个长方形
	var boxSd = new b2BoxDef();
	boxSd.density = 1.0;	 //密度
	boxSd.friction = 1;	 //摩擦系数
	boxSd.restitution = 0.4; //反弹系数
	boxSd.extents.Set(40,20);//设置大小
	boxSd.userData = document.getElementById('bus');
	var boxBd = new b2BodyDef();
	boxBd.AddShape(boxSd);
	boxBd.position.Set(x,y);
	return world.CreateBody(boxBd);
}

var createWheel = function(world,x,y){
	//定义车轮形状
	var ballSd = new b2CircleDef();
	ballSd.density = 1.0;
	ballSd.radius = 10 ;
	ballSd.restitution = 0.1;
	ballSd.friction = 1;
	ballSd.userData = document.getElementById('wheel');
	//定义物体
	var ballBd = new b2BodyDef();
	ballBd.AddShape(ballSd);
	ballBd.position.Set(x,y);
	return world.CreateBody(ballBd);
}

var createCatAt = function(x,y){
	//创建车身
	var carBody = createRect(carGame.world,x,y);
	//创建车轮
	var wheelBody1 = createWheel(carGame.world, x-25, y+20);
	var wheelBody2 = createWheel(carGame.world, x+25, y+20);

	//将左车轮连接到车身上
	var jointDef = new b2RevoluteJointDef();
	jointDef.anchorPoint.Set(x-25, y+20);
	jointDef.body1 = carBody;
	jointDef.body2 = wheelBody1;
	carGame.world.CreateJoint(jointDef);
	//将右车轮连接到车身上
	var jointDef = new b2RevoluteJointDef();
	jointDef.anchorPoint.Set(x+25, y+20);
	jointDef.body1 = carBody;
	jointDef.body2 = wheelBody2;
	carGame.world.CreateJoint(jointDef);

	return carBody;
}

/**
* 游戏初始化模型
* restartGame逻辑跟这里是一致的！
*/
var createGameModelByLevel = function(level){
	carGame.currentLevel = level;

	$('#level').html('Level ' + level);
	$('#game').removeClass().addClass('gamebg_level' + level);

	carGame.world = createWorld();
	console.log('The world is created. ', carGame.world);
	
	//根据关卡数据创建物体
	for(var i = 0; i < carGame.levels[level].length; i++){
		var obj = carGame.levels[level][i];
		if(obj.type == 'car'){
			carGame.car = createCatAt(obj.x,obj.y);
			carGame.fuel = obj.fuel;
			carGame.fuelMax = obj.fuel;
			$('.fuel-value').width('100%');
			continue;
		}
		var groundBody = createGround(obj.x,obj.y,obj.width,obj.height,obj.rotation,obj.type);
		if(obj.type == 'win'){
			carGame.gamewinWall = groundBody;
		}

	}
}



/************	物理世界时间推进函数（相对于游戏主循环）	**************/
var step = function(){
	//第一个参数告诉了计算机要计算当前时间多少秒以后的世界，Box2D官方推荐为1/60秒（其实这个时间应该跟我们重绘canvas的时间一致）
	var dt = 1/60;
	//迭代次数，影响物体碰撞的计算精度，太高会导致速度过慢
	var iterations = 10;

	carGame.world.Step(dt, iterations);	
	//绘制物理世界
	drawWorld(carGame.world,ctx);
	setTimeout(step,1000/60);

	//轮循碰撞发生列表来检测汽车是否集中胜利目的地
	for(var cn = carGame.world.GetContactList(); cn != null; cn = cn.GetNext()){
		var body1 = cn.GetShape1().GetBody();
		var body2 = cn.GetShape2().GetBody();
		if((body1 == carGame.car && body2 == carGame.gamewinWall) || 
		   (body2 == carGame.car && body1 == carGame.gamewinWall)){
			console.log('Level Passed!');
			if(carGame.currentLevel < 4){
				createGameModelByLevel(++carGame.currentLevel);
			}else{
				//显示游戏通关画面
				$('#game').removeClass().addClass('gamebg_won');
				//清空物理世界(本质是重新创建一个蓝色清净的世界)
				carGame.world = createWorld();
			}
			
		}
	}
}



/************	绘制物理世界函数	**************/

var drawWorld = function(world,context){
	ctx.clearRect(0,0, canvasWidth,canvasHeight);
	for(var b = world.m_bodyList; b!= null; b = b.m_next){
		for(var s = b.GetShapeList(); s != null; s = s.GetNext()){
			//drawShape(s, context);
			if(s.GetUserData() != undefined){
				//用户数据包含图片的引用
				var img = s.GetUserData();
				//图片的x和y，需要宽和高各处以2
				var x = s.GetPosition().x;
				var y = s.GetPosition().y;
				var topleftX = -$(img).width()/2;
				var topleftY = -$(img).height()/2;

				context.save();
				//图片资源那里可以优化！！
				context.translate(x,y);
				context.rotate(s.GetBody().GetRotation());
				context.drawImage(img,topleftX, topleftY);

				context.restore();
			}else{
				//使用了游戏图形显示，就不用绘制物理对象轮廓
				//实质上是【用带场景大背景图】，不用【为场景物理对象独立贴图】
				//drawShape(s, context);
			}

		}
	}
}

var drawShape = function(shape,context){
	context.strokeStyle = '#003300';
	context.beginPath();
	switch(shape.m_type){
		case b2Shape.e_circleShape:
			var circle = shape;
			var pos = circle.m_position;
			var r = circle.m_radius;
			var segments = 16;	
			var theta = 0.0;
			var dtheta = 2.0*Math.PI/segments;
			//绘制圆形
			context.moveTo(pos.x+r,pos.y);
			for(var i = 0; i<segments; i++){
				var d = new b2Vec2(r*Math.cos(theta),r*Math.sin(theta));
				var v = b2Math.AddVV(pos,d);
				context.lineTo(v.x,v.y);
				theta += dtheta;
			}
			context.lineTo(pos.x+r,pos.y);
			//绘制半径
			context.moveTo(pos.x,pos.y);
			var ax = circle.m_R.col1;
			var pos2 = new b2Vec2(pos.x+r*ax.x, pos.y+r*ax.y);
			context.lineTo(pos2.x,pos2.y);
			break;

		case b2Shape.e_polyShape:
			var poly = shape;
			var tV = b2Math.AddVV(poly.m_position, b2Math.b2MulMV(poly.m_R,poly.m_vertices[0]) );
			context.moveTo(tV.x,tV.y);
			for(var i = 0; i<poly.m_vertexCount; i++){
				var v = b2Math.AddVV(poly.m_position, b2Math.b2MulMV(poly.m_R,poly.m_vertices[i]) );
				context.lineTo(v.x,v.y);
			}
			context.lineTo(tV.x,tV.y);
			break;
	}

	context.stroke();
}







