//全局对象包含飞车游戏所需要的变量
var carGame = {};
var canvas,ctx,canvasWidth,canvasHeight;

$(function(){
	//创建物理世界
	carGame.world = createWorld();
	console.log('The world is created. ', carGame.world);
	//创建地面
	createGround();

	//注意x,y都是已中点计算位置的
	createRect(carGame.world,50,210);

	createRect(carGame.world,0,0);
	createRect(carGame.world,-20,60);
	createRect(carGame.world,200,160);

	createWheel(carGame.world, 25, 230);
	createWheel(carGame.world, 75, 230);

	createWheel(carGame.world, 200, 130);
	createWheel(carGame.world, 300, 200);


	//获取上下文引用
	canvas = document.getElementById('game');
	ctx = canvas.getContext('2d');
	canvasWidth = parseInt(canvas.width);
	canvasHeight = parseInt(canvas.height);

	//绘制物理世界
	drawWorld(carGame.world,ctx);

	//开始推进时间步
	step();
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

var createGround = function(){
	//定义长方形的形状
	var groundSd = new b2BoxDef();
	groundSd.extents.Set(250,25);	//设置形状的长宽500,50
	groundSd.restitution = 0.4;		//设置形状的反弹系数

	//定义物体，并将它与上面定义的形状进行关联
	var groundBd = new b2BodyDef();
	groundBd.AddShape(groundSd);
	groundBd.position.Set(250,370);
	var body = carGame.world.CreateBody(groundBd);

	return body;
}

var createRect = function(world,x,y){
	//创建一个长方形
	var boxSd = new b2BoxDef();
	boxSd.density = 1.0;	 //密度
	boxSd.friction = 1.5;	 //摩擦系数
	boxSd.restitution = 0.4; //反弹系数
	boxSd.extents.Set(40,20);//设置大小
	var boxBd = new b2BodyDef();
	boxBd.AddShape(boxSd);
	boxBd.position.Set(x,y);
	world.CreateBody(boxBd);
}

var createWheel = function(world,x,y){
	//定义车轮形状
	var ballSd = new b2CircleDef();
	ballSd.density = 1.0;
	ballSd.radius = 10 ;
	ballSd.restitution = 0.1;
	ballSd.friction = 4.3;
	//定义物体
	var ballBd = new b2BodyDef();
	ballBd.AddShape(ballSd);
	ballBd.position.Set(x,y);
	return world.CreateBody(ballBd);
}

var step = function(){
	carGame.world.Step(1.0/60, 1);
	ctx.clearRect(0,0, canvasWidth,canvasHeight);
	drawWorld(carGame.world,ctx);
	setTimeout(step,10);
}


/************	绘制物理世界函数	**************/

var drawWorld = function(world,context){
	for(var b = world.m_bodyList; b!= null; b = b.m_next){
		for(var s = b.GetShapeList(); s != null; s = s.GetNext()){
			drawShape(s, context);
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







