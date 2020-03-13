/***********************************************************************************
********************************** Priority Queue **********************************
************************************************************************************/

let swap = (array, index1, index2) => {
  if (array !== undefined && index1 !== undefined && index2 !== undefined) {
    let tmp = array[index1];
    array[index1] = array[index2];
    array[index2] = tmp;
  }
}

/**Priority queue
 * Heap-based priority queue that can take in any object containing a generic compare()
 * function to compare priorities of objects within the queue. By default, the "lower"-
 * valued object has higher priority.
 */
class PriorityQueue {
  // TODO: implement reverseOrder
  // By default, "lowest" value of objects are highest prioritiy.
  constructor(reverseOrder = false) {
    this.heap = [];
    this.reverseOrder = reverseOrder;
  }

  isEmpty() {
    return (this.heap.length == 0);
  }

  getSize() {
    return this.heap.length;
  }

  contains(node) {
    let containsNode = false;
    for (let indexNode of this.heap) {
      if (node === indexNode) {
        containsNode = true;
        break;
      }
    }
    return containsNode;
  }

  enqueue(node) {
    this.heap.push(node);
    let currentIndex = this.heap.length - 1;
    let parentIndex = parseInt((currentIndex) / 2);
    while ((this.heap[currentIndex].compare(this.heap[parentIndex]) < 0) && (currentIndex !== 0)) {
      swap(this.heap, currentIndex, parentIndex);
      currentIndex = parentIndex;
      parentIndex = parseInt((currentIndex) / 2);
    }
  }

  dequeue() {
    swap(this.heap, 0, this.heap.length - 1);
    let dequeued_node = this.heap.pop();

    if (this.heap.length > 1) {
      let currentIndex = 0;
      let swapIndex = currentIndex;
      let child0Index = currentIndex * 2;
      let child1Index = child0Index + 1;
      let continueLoop = true;
      while (continueLoop) {
        if (child0Index < this.heap.length) {
          if (this.heap[swapIndex].compare(this.heap[child0Index]) > 0) {
            swapIndex = child0Index;
          }
        }

        if (child1Index < this.heap.length) {
          if (this.heap[swapIndex].compare(this.heap[child1Index]) > 0) {
            swapIndex = child1Index;
          }
        }

        continueLoop = (swapIndex !== currentIndex);
        swap(this.heap, currentIndex, swapIndex);
        currentIndex = swapIndex;
        child0Index = currentIndex * 2;
        child1Index = child0Index + 1;
      }
    }
    return dequeued_node;
  }
};

/************************************************************************************
******************************** A* Search Algorithm ********************************
*************************************************************************************/

let getDistance = (node1, node2) => {
  let distance = Infinity;
  if (node1 !== undefined && node2 !== undefined) {
    let diffX = (node2.x - node1.x);
    let diffY = (node2.y - node1.y);
    distance = Math.sqrt((diffX*diffX) + (diffY*diffY));
  }
  return distance;
}

class AStarGraph {
  constructor() {
    this.gScore = {};
    this.fScore = {};
    this.nodes = {};
    this.nodeCounter = 0;
  }

  // Create and add node to graph. Each node is given a unique ID for this graph.
  createAndAddNode(x, y, id) {
    let newId;
    if (id !== undefined) {
      newId = id;
    } else {
      while(Object.keys(this.nodes).includes("" + this.nodeCounter)) {
        this.nodeCounter += 1;
      }
      newId = this.nodeCounter;
    }

    if (Object.keys(this.nodes).includes("" + newId)) {
      console.log("Warning: AStarGraph node ID has been overwritten");
    }
    let newNode = new GraphNode(newId, x, y, this.gScore, this.fScore);
    this.nodes[newId] = newNode;

    return newNode;
  }

  connectNodesById(nodeId1, nodeId2) {
      this.connectNodes(this.nodes[nodeId1], this.nodes[nodeId2]);
  }

  connectNodes(node1, node2) {
    if (node1 !== undefined && node2 !== undefined) {
        node1.addNeighbour(node2);
        node2.addNeighbour(node1);
    } else {
        console.log("Warning: Attempted to connect undefined nodes!");
    }
  }

  /**Get the shortest path of nodes from startNode to destinationNode.
   * Apply the A* search algorithm to find the shortest path from the starting node to the destination node.
   * @return [] - An array of nodes indicating the shortest path from startNode to destinationNode.
   */
  getShortestPath(startNode, destinationNode) {
    // console.log("startNode: " + startNode.id + " | destinationNode: " + destinationNode.id);
    let nodeQueue = new PriorityQueue();
    nodeQueue.enqueue(startNode);

    let cameFrom = {};

    for (let id of Object.keys(this.nodes)) {
      this.gScore[id] = Infinity;
      this.fScore[id] = Infinity;
    }

    this.gScore[startNode.id] = 0;
    this.fScore[startNode.id] = this.heuristic(startNode, destinationNode);

    while (!nodeQueue.isEmpty()) {
      let current = nodeQueue.dequeue();
      if (current.id === destinationNode.id) {
        return this.reconstructPath(cameFrom, current);
      }

      for (let neighbourId of Object.keys(current.neighbourDistances)) {
        let neighbour = this.nodes[neighbourId];

        let tentativeGScore = this.gScore[current.id] + current.neighbourDistances[neighbour.id];
        if (tentativeGScore < this.gScore[neighbour.id]) {
          cameFrom[neighbour.id] = current;
          this.gScore[neighbour.id] = tentativeGScore;
          this.fScore[neighbour.id] = this.gScore[neighbour.id] + this.heuristic(neighbour, destinationNode);
          if (!nodeQueue.contains(neighbour)) {
            nodeQueue.enqueue(neighbour);
          }
        }
      }
    }
    return undefined;
  }

  // Get the heuristic value from currentNode to destinationNode.
  heuristic(currentNode, destinationNode) {
    return getDistance(currentNode, destinationNode);
  }

  /**Reconstruct the shortest path of nodes determined by the A* search algorithm.
   * @return [] - An array of nodes indicating the shortest path from a start node to a destination node.
   */
  reconstructPath(cameFrom, current) {
    let totalPath = [current];
    while (Object.keys(cameFrom).includes("" + current.id)) {
      current = cameFrom[current.id];
      totalPath.unshift(current);
    }
    return totalPath;
  }

  getClosestNode(x, y) {
      let node = {x : x, y : y};
      console.log("node: ", node);
      let shortestDistance = Infinity;
      let closestNodeId;
      let distance;
      for (let id of Object.keys(this.nodes)) {
        distance = getDistance(node, this.nodes[id]);
        console.log("distance: ", distance);
        if (distance < shortestDistance) {
            closestNodeId = id;
            shortestDistance = distance;
        }
      }
      return this.nodes[closestNodeId];
  }
};

/**GraphNode
 * GraphNode point in a Cartesian coordinate system. Generally created by and associated with a AStarGraph
 * for performing a shortest path search between two nodes.
 */
class GraphNode {
  constructor(id, x, y, fScore) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.fScore = fScore;
    this.neighbourDistances = {};
  }

  // Add a node as a neighbour (i.e. adjacent).
  addNeighbour(node) {
    let distance = getDistance(this, node);
    this.neighbourDistances[node.id] = distance;
  }

  /**Compare with another GraphNode.
   * NOTE: TO BE USED DURING AN A* SEARCH ONLY.
   * Compares the f() value of two nodes with respect to a destination node.
   * f() = g() + h(), where g() is the cumulative distance traveled from the
   * start node, and h() is the heuristic for reaching the destination node.
   */
  compare(node) {
    let returnValue = -2;
    if (node !== undefined) {
      if (this.fScore[this.id] > node.fScore[node.id]) {
        returnValue = 1;
      } else if (this.fScore[this.id] === node.fScore[node.id]) {
        returnValue = 0;
      } else {
        returnValue = -1;
      }
    }
    return returnValue;
  }

  toString() {
    let nodeInfo = `${this.id}: [${this.x}, ${this.y}] -`;
    for (let neighbourId of Object.keys(this.neighbourDistances)) {
      nodeInfo += "\n  " + neighbourId + ": " + this.neighbourDistances[neighbourId] + " m";
    }
    return nodeInfo;
  }
};

var gMapGraph = new AStarGraph();


/***********************************************************************************
******************************** Map Initialization ********************************
************************************************************************************/

//加载场景代码
var app = new THING.App({
    // 场景地址
    "url": "/api/scene/b0a1c1544fb5933252410fba",
    //背景设置
    "skyBox": "BlueSky"
});

// 加载场景后执行
var building = null;
var mousedownPos = null;

let person = app.query('person')[0];

let beacons = [];

let waypoints = [];

let lines = [];

let position = {
    x: 0,
    y: 0,
    orientation: 0
}

//===============点击进入=======================
app.on('load', function (ev) {
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
            console.log(event.pickedPosition)
            if (event.pickedPosition)
                mousedownPos = event.pickedPosition
        } else if (event.button == 2) {
            console.log(JSON.stringify(event.object))
        }
    });
    
    app.camera.enablePan
    // app.camera.enableRotate = false;
    
    createSearchBox();

    person = app.query('person')[0];

    person.visible = false

    //Custom code

    beacons = app.query('beacon');

    waypoints = app.query('waypoint');

    for (let i = 0; i < beacons.length; i++) {
        beacons[i].visible = false;
    }

    for (let i = 0; i < waypoints.length; i++) {
        waypoints[i].visible = false;
    }



    initializeMapGraph();


    hideAllLines();


    updatePosition();
});

let firstUpdate = true;

let updatePosition = () => {
	$.ajax({
		type: "get",
		url: "http://3.209.66.199:3000/",
        headers: { "Access-Control-Allow-Origin" : "*" },
        crossDomain: true,
		dataType: "json",
		success: (d) => {
            position = JSON.parse(d.position);

            person.position = [position.x, 0, position.y];
            
            if (firstUpdate) {
                firstUpdate = false;
                person.visible = true
            }

			timer = setTimeout(() => {
				updatePosition()
			}, 1000);
		}
	});
}

function createSearchBox() {
    // 使用 bootstrap 样式
    var template =
        `<div style="position:absolute;top:20px;left:50%;margin-left:-150px;z-index:2;padding: 4px 10px;background-color:rgba(219,245,255,0.4);"><input id="searchId" type="text" placeholder="Search by device ID?" style="width:220px;height:30px;border:1px solid #5af7fa;border-radius: 4px;background-color:rgba(0,92,85,0.9);color:#fff;padding:0 5px;"/><span onclick="searchEqById()" style="margin-left:6px;font-size:13px;color: #fff;cursor:pointer;">Go</span></div>`;
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


new THING.widget.Button('Scan', function () { moveMan(0, 1); console.log("TODO: SCAN");});

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

let hideAllLines = () => {
    for (let i = 0; i < lines.length; i++) {
        lines[i].line.visible = false;
    }
}

let showLine = (p1x, p1y, p2x, p2y) => {
    for (let i = 0; i < lines.length; i++) {
        let l = lines[i];
        if ((p1x === l.x1 && p1y === l.y1 && p2x === l.x2 && p2y === l.y2) || (p2x === l.x1 && p2y === l.y1 && p1x === l.x2 && p1y === l.y2)) l.visible = true;        
    }
}

let showPathLines = (path) => {
    for (let index = 0; index < path.length - 1; index++) {
        showLine(path[index].x, path[index].y, path[index + 1].x, path[index + 1].y);
    }
}

let navigate = (startId, destinationId) => {
    let startThing = app.query("#" + startId)[0];
    let startNode = gMapGraph.getClosestNode(startThing.position[0], startThing.position[2]);
    console.log("startNode: ", startNode);

    let destinationThing = app.query("#" + destinationId)[0];
    let destinationNode = gMapGraph.getClosestNode(destinationThing.position[0], destinationThing.position[2]);
    console.log("destinationNode: ", destinationNode);

    let shortestPath = gMapGraph.getShortestPath(startNode, destinationNode);
    hideAllLines();
    if (shortestPath !== undefined) {
        showPathLines(shortestPath);
    } else {
        console.log("No possible path found from current location to destination");
    }
}

/*** Test functions ***/

let initializeMapGraph = () => {
    for (let i = 0; i < waypoints.length; i++) {
        let pos = waypoints[i].position;
        gMapGraph.createAndAddNode(pos[0], pos[2], waypoints[i]._id);
    }

    for (let i = 0; i < waypoints.length; i++) {
        let neighbours = waypoints[i]._userData.neighbour.split(',');
        
        for (let j = 0; j < neighbours.length; j++) {
            gMapGraph.connectNodesById(waypoints[i]._id, "w" + neighbours[j]);
            let pos1 = waypoints[i].position;
            let pos2 = app.query('#w' + neighbours[j])[0].position;
            drawLine(pos1[0], pos1[2], pos2[0], pos2[2]);
        }
    }
}

let drawLine = (p1x, p1y, p2x, p2y) => {
    if (p1x === undefined || p1y === undefined || p2x === undefined || p2y === undefined) return;

    for (let i = 0; i < lines.length; i++) {
        let l = lines[i];
        if ((p1x === l.x1 && p1y === l.y1 && p2x === l.x2 && p2y === l.y2) || (p2x === l.x1 && p2y === l.y1 && p1x === l.x2 && p1y === l.y2)) return;
    }

    const dx = p1x - p2x;
    const dy = p1y - p2y;

    const magnitude = Math.sqrt(dx*dx + dy*dy);
    
    const midx = (p1x + p2x) / 2;
    const midy = (p1y + p2y) / 2;

    const angle = Math.round(Math.atan2(dy, dx) * 180 / Math.PI);

    const line_obj = app.create({
        type: 'Cylinder',
        radius: 0.1,
        height: magnitude,
        radiusSegments: 8,
        position:[midx, 1, midy],
        angles: [90, 0, angle + 90],
        color: "red"
    });

    const line = {
        x1: p1x,
        y1: p1y,
        x2: p2x,
        y2: p2y,
        line: line_obj
    };

    lines.push(line);
}
