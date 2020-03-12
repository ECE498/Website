//加载场景代码
var app = new THING.App({
    // 场景地址
    "url": "https://www.thingjs.com/client/ThingJS/28338/20190613114500011313150",
    //背景设置
    "skyBox": "BlueSky"
});

// 加载场景后执行
var building = null;
var mousedownPos = null;

// var stag = document.createElement("script");
// stag.src = "./PriorityQueue.js";
// document.body.appendChild(stag);

// // window.PriorityQueue;
// console.log(window.PriorityQueue);
//===============点击进入=======================
app.on('load', function (ev) {
    // building = ev.buildings[0];
    // var campus = ev.campus;
    // app.level.change(campus);
    //设置初始视角
    app.camera.fit({
        object: building,
        // radius: 70,
        radiusFactor: 0.6, // 物体包围盒半径的倍数,
        xAngle: 20, // 绕物体自身X轴旋转角度
        yAngle: 0, // 绕物体自身X轴旋转角度
    })
    //限制视角，看不到下面
    app.camera.yAngleLimited = [0, 90];
    // 缩放限制 2D
    app.camera.zoomLimited = [0, 30];
    //视角距离
    app.camera.distanceLimited = [0, 350];
    // 右键按下记录下当前位置
    //取点坐标
    app.on('mousedown', function (event) {
        if (event.button == 0) {
            // console.log(JSON.stringify(event))
            console.log(event.getPickedPosition())
            if (event.getPickedPosition())
                mousedownPos = event.getPickedPosition()
        } else if (event.button == 2) {
            console.log(JSON.stringify(event.object))
        }
    });
    // click时，小于4像素执行才执行
    app.on('click', function (event) {
        if (event.button == 0) {
            if (event.getPickedPosition()) {
                linesArrayOne.forEach(function (obj) {
                    app.query("#" + obj.line)[0].visible = event.object.id == obj.start || event.object.id == obj.end || event.object.id == obj.line;
                });
            }
        }
    });
    app.camera.enablePan 
    // app.camera.enableRotate = false;
    initLeveLis();
    addThings();
    createSearchBox();
    invisibleLines();


});

var linesArrayOne = [
    {
        "line": "line_001",
        "end": "end_point",
        "start": "start_point"
    }
];

function invisibleLines() {
    linesArrayOne.forEach(function (obj) {
        var line = app.query("#" + obj.line)[0];
        var end = app.query("#" + obj.end)[0];
        var start = app.query("#" + obj.start)[0];
        line.style.color = "#ff0000"
        line.visible = false;
        start.on('click', function (ev) {
            line.visible = true;
        });
        end.on('click', function (ev) {
            line.visible = true;
        });
    });
}

function createSearchBox() {
    // 使用 bootstrap 样式
    var template =
        `<div style="position:absolute;top:20px;left:50%;margin-left:-150px;z-index:2;padding: 4px 10px;background-color:rgba(219,245,255,0.4);"><input id="searchId" type="text" placeholder="请输入设备ID" style="width:220px;height:30px;border:1px solid #5af7fa;border-radius: 4px;background-color:rgba(0,92,85,0.9);color:#fff;padding:0 5px;"/><span onclick="searchEqById()" style="margin-left:6px;font-size:13px;color: #fff;cursor:pointer;">确定</span></div>`;
    var btn = $('#div2d').append($(template));
    return btn;
}
function searchEqById() {
    var searchId = document.getElementById("searchId").value;
    if (searchId) {
        console.log(searchId);
        changeCampu(searchId);
    } else {
        alert("请先输入设备ID");
    }
}
function changeCampu(id) {
    var thing = app.query('#' + id)[0];
    if (thing) {
        app.level.change(thing);
    } else {
        // alert(id + "建筑未找到！");
    }
}


new THING.widget.Button('进入建筑', function () {
    var floor = app.query('.Floor')[0];
    // var floor = app.query('#R001_001_047')[0];
    app.level.change(floor);
});

new THING.widget.Button('退出建筑', function () {
    var floor = app.query('.Campus')[0];
    app.level.change(floor);
});

new THING.widget.Button('复原', function () {
    thiz.position = [-23.224302400141845, -0.09000000000000137, -12.96061607015777]
});

new THING.widget.Button('左移', function () { moveMan(0, 1); console.log(window.PriorityQueue);});
new THING.widget.Button('右移', function () { moveMan(1, 1) });
new THING.widget.Button('前移', function () { moveMan(2, 1) });
new THING.widget.Button('后移', function () { moveMan(3, 1) });
// new THING.widget.Button('开启第一人称行走', ownWalk);
// new THING.widget.Button('关闭第一人称行走', closeWalk);

var thiz = null;
function addThings() {
    thiz = app.query('#001')[0]

    // app.camera.viewMode = THING.CameraView.TopView;
    // console.log('thing created: ' + this.id);
    // this.scale = [7, 9, 7];
    thiz.style.color = "#ff0000";
    // this.scaleTo({
    //     scale: [1.5, 1.5, 1.5], // 缩放倍数
    //     time: 2500, // 动画时间
    //     loopType: THING.LoopType.PingPong // 循环类型 设置循环后 无回调函数
    // })
    thiz.draggable = true;
    // 拖拽结束 
    thiz.on('dragend', function (ev) {
        app.camera.fit({
            object: thiz,
            radius: 10,
            xAngle: 90, // 绕物体自身X轴旋转角度
            yAngle: 10, // 绕物体自身Y轴旋转角度
        })
        getPanl(thiz.position[0], thiz.position[2]);
    });

    // 拖拽中 
    thiz.on('drag', function (ev) {
        /* drag的两个参数:
            ev.object	        当前拾取物体,类型:BaseObject
            ev.pickedPosition	获取拾取点坐标,类型:Array.[Number]
        */
        // ev.object.position = ev.pickedPosition;
        if (ev.picked) {
        var    worldPos = ev.getPickedPosition();
            // console.log(ev.pickedPosition);
        }
    });

    // thiz.on('update', function () {
    //     thiz.style.opacity = 0.5 + 0.5 * Math.sin(2 * app.elapsedTime / 1000);
    // }, '每帧改变透明度');
    thiz.scaleTo({
        scale: [1.1, 1.1, 1.1], // 缩放倍数
        time: 2500, // 动画时间
        loopType: THING.LoopType.PingPong // 循环类型 设置循环后 无回调函数
    })
}

var things = [
    { "type": "Thing", "id": "box_001", "name": "box_001", "position": [-16.534, -0.09000000000000001, -13.913], "angles": [0, 0.11459163542067485, 0], "scale": [1, 1, 1], "style": { "color": null, "opacity": 1, "outlineColor": "#FF8000", "alwaysOnTop": false, "glow": false, "innerGlow": false } },
    { "type": "Thing", "id": "box_002", "name": "box_002", "position": [-12.982, -0.09000000000000001, -10.536], "angles": [0, 0.11459163542067485, 0], "scale": [1, 1, 1], "style": { "color": null, "opacity": 1, "outlineColor": "#FF8000", "alwaysOnTop": false, "glow": false, "innerGlow": false } }
]

var uia = [];
function getPanl(x, y) {
    destoryAnchor();
    things = app.query('.Floor')[0].things;
    things.forEach(function (obj) {
        var tx = obj.position[0];
        var ty = obj.position[2];
        var result = Math.sqrt(Math.pow(Math.abs(tx - x), 2) + Math.pow(Math.abs(ty - y), 2));
        console.log(result);
        if (result < 1.5 && uia.indexOf(obj.id) == -1) {
            uia.push(createUIAnchor(obj.id));
        }
    })
}


function destoryAnchor() {
    uia.forEach(function (obj) {
        obj.destroy();
    })
    uia.length = 0;
}


// 创建UIAnchor
function createUIAnchor(id) {
    var obj = app.query('#' + id)[0];
    // 创建widget (绑定数据用)
    var panel = new THING.widget.Panel({
        // 设置面板宽度
        width: '150px',
        // cornerType 角标样式
        // 没有角标 none ，没有线的角标 noline ，折线角标 polyline
        cornerType: 'polyline'
    })
    console.log(obj.getAttribute('name'));
    panel.addString(obj, 'id').caption('id');
    // panel.addString(obj.userData, 'name').caption('name');
    // panel.addString(obj.userData, 'desc').caption('desc');
    panel.addString(obj, 'name').caption('name');
    console.log(JSON.stringify(obj));

    // 创建UIAnchor面板
    var uiAnchor = app.create({
        // 类型
        type: 'UIAnchor',
        // 父节点设置
        parent: obj,
        // 要绑定的页面的 element 对象
        element: panel.domElement,
        // 设置 localPosition 为 [0, 0, 0]
        localPosition: [0, 0, 0],
        // 指定页面的哪个点放到localPosition位置上(百分比)
        pivot: [-0.2, 1.5]
    });

    return uiAnchor;
}

//左 右 上 下
function moveMan(dir, count) {
    if (0 == dir) {
        var pos = thiz.position[0] += 1
        thiz.position = [pos, thiz.position[1], thiz.position[2]];
    } else if (1 == dir) {
        var pos = thiz.position[0] -= 1
        thiz.position = [pos, thiz.position[1], thiz.position[2]];
    } else if (2 == dir) {
        var pos = thiz.position[2] += 1
        thiz.position = [thiz.position[0], thiz.position[1], pos];
    } else if (3 == dir) {
        var pos = thiz.position[2] -= 1
        thiz.position = [thiz.position[0], thiz.position[1], pos];
    }
    getPanl(thiz.position[0], thiz.position[2]);
}

function initLeveLis() {
    // 监听建筑层级的 EnterLevel 事件
    app.on(THING.EventType.EnterLevel, ".Building", function (ev) {
        // 当前进入的层级对象
        var current = ev.current;
        // 上一层级对象
        var preObject = ev.previous;
        // 如果当前层级对象的父亲是上一层级对象（即正向进入）
        if (current.parent == preObject) {
            if (preObject.type == "Campus") {
                // particle.visible = false
                // 暂停系统内置的左键双击进入下一层级操作
                app.pauseEvent(THING.EventType.DBLClick, '*', THING.EventTag.LevelEnterOperation);
                // 暂停系统内置的右键单击返回上一层级操作
                app.pauseEvent(THING.EventType.Click, '*', THING.EventTag.LevelBackOperation);
                app.camera.enablePan = true
            }

            console.log("从 " + preObject.type + " 进入了 " + current.type);
        }
        else {
            console.log("进入 " + current.type + "（从 " + preObject.type + " 退出）");
        }
    });
    // [0.8419063091281049, 0.009999999999999919, 0.17960312300051479]
    // 监听建筑层级的 LeaveLevel 事件
    app.on(THING.EventType.LeaveLevel, ".Building", function (ev) {
        // 要进入的层级对象
        var current = ev.current;
        // 上一层级对象（退出的层级）
        var preObject = ev.previous;
        console.log("THING.EventType.EnterLevel:" + JSON.stringify(current));
        if (current.parent === preObject) {
            console.log("退出 " + preObject.type + " 进入 " + current.type);
        }
        else {
            console.log("退出 " + preObject.type + " ，返回 " + current.type);
            // particle.visible = true
            app.camera.enablePan = false
            // 暂停系统内置的左键双击进入下一层级操作
            app.resumeEvent(THING.EventType.DBLClick, '*', THING.EventTag.LevelEnterOperation);
            // 暂停系统内置的右键单击返回上一层级操作
            app.resumeEvent(THING.EventType.Click, '*', THING.EventTag.LevelBackOperation);
        }
    })
}

// var ctrl

// function closeWalk() {
//     if (ctrl) {
//         app.removeControl(ctrl);
//         ctrl = null;
//     }
// }

// function ownWalk() {
//     if (ctrl) return
//     app.camera.position = [-24.524007536596862,-0.0899999999999995,-13.372722742690318];
//     ctrl = new THING.WalkControl({ // 参数可以动态修改
//         walkSpeed: 0.04, // 行走速度
//         // walkSpeed: 1, // 行走速度
//         turnSpeed: 0.15, // 右键旋转速度
//         gravity: 29.8, // 物体重量
//         eyeHeight: 1.6, // 人高度
//         jumpSpeed: 4, // 按空格键 跳跃的速度
//         enableKeyRotate: false, // 默认不开启键盘控制旋转
//         useCollision: true, // 默认不开启碰撞检测
//         useGravity: true // 默认开启重力
//     })
//     app.addControl(ctrl);
// }