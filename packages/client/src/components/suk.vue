<template>
  <div ref="pixiContainer" class="pixi-container"></div>
  <!-- 示例输入框 -->
  <input v-model.number="progress" type="range" min="0" max="100" />
  <span>{{ progress }}%</span>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue';
import { Application, Graphics, Texture, Sprite, Text } from 'pixi.js';

const pixiContainer = ref(null);
let app;
let ball;

// 路径点数组：保存所有轨迹坐标
const path = [];
let pathIndex = 0;
let animationId = null;
let progress = ref(0);

// 初始化 PixiJS 应用并绘制赛道
async function initPixiAndDrawSuzukaCircuit() {
  // 创建 Pixi 应用
  app = new Application();
  await app.init({
    width: 800,
    height: 600,
    background: '#1099bb',
    resizeTo: window,
    antialias: true,
  });

  if (pixiContainer.value) {
    pixiContainer.value.appendChild(app.canvas);
  }

  // 设置画布原点为其中心点
  app.stage.pivot.set(0, 0);
  app.stage.position.set(0, 0);

  // 创建图形对象并绘制赛道
  const graphics = new Graphics();

  // 设置线条样式
  graphics.setStrokeStyle({
    width: 16,
    color: 0xffffff,
  });

  // 构建路径，并记录每一步的坐标到 path 数组中
  buildSuzukaPath(graphics);

  // 将图形添加到舞台
  app.stage.addChild(graphics);

  // 创建小球
  ball = new Sprite(Texture.WHITE);
  ball.tint = 0xff0000; // 红色
  ball.width = 16;
  ball.height = 16;
  ball.anchor.set(0.5);
  app.stage.addChild(ball);

  updateBallPosition(progress.value);

  // 监听 progress 变化
  watchEffect(() => {
    updateBallPosition(progress.value);
  });

  // 启动动画
  // animateBall();

  // setInterval(() => {
  //   pathIndex++;
  // }, 100);
}

// 构建赛道路径，并将每个坐标点记录下来用于动画
function buildSuzukaPath(graphics) {
  path.length = 0; // 清空旧路径
  pathIndex = 0;

  let x = 50,
    y = 300;

  // 添加初始点
  path.push({ x, y });
  graphics.moveTo(x, y);

  // 弧线函数封装：返回一系列中间点
  function addArcPoints(cx, cy, r, startAngle, endAngle, antiClockwise = false) {
    const segments = 30;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = startAngle + (endAngle - startAngle) * t * (antiClockwise ? -1 : 1);
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);
      path.push({ x: px, y: py });
      graphics.lineTo(px, py);
    }
  }

  // 直线函数封装
  function addLinePoints(toX, toY) {
    const steps = 100;
    for (let i = 1; i <= steps; i++) {
      const px = x + (toX - x) * (i / steps);
      const py = y + (toY - y) * (i / steps);
      path.push({ x: px, y: py });
      graphics.lineTo(px, py);
    }
    x = toX;
    y = toY;
  }

  // 添加弯道标记函数
  function addTurnMarker(turnNumber, offsetX = 0, offsetY = 0) {
    const marker = new Text(turnNumber, {
      fill: 0x000000,
      fontSize: 16,
    });
    marker.position.set(x + offsetX, y + offsetY);
    app.stage.addChild(marker);
  }

  // T15 (起点)
  addTurnMarker('T15', 0, -20);
  addLinePoints(500, 100); // 向右的直线

  // T14
  addTurnMarker('T14', 20, 0);
  addArcPoints(500, 200, 100, -Math.PI / 2, 0, false); // 右下弯

  // T10
  addTurnMarker('T10', 20, 20);
  addLinePoints(600, 200); // 向右的直线

  // T11
  addTurnMarker('T11', 20, 0);
  addArcPoints(600, 300, 100, 0, Math.PI / 2, false); // 右下弯

  // T9
  addTurnMarker('T9', 0, 20);
  addLinePoints(500, 400); // 向左的直线

  // T6
  addTurnMarker('T6', -20, 0);
  addArcPoints(500, 300, 100, Math.PI / 2, Math.PI, false); // 左上弯

  // T12
  addTurnMarker('T12', -20, -20);
  addLinePoints(400, 300); // 向左的直线

  // T8
  addTurnMarker('T8', 0, -20);
  addArcPoints(300, 300, 100, 0, Math.PI, false); // 大左弯

  // T7
  addTurnMarker('T7', -20, 0);
  addLinePoints(200, 300); // 向左的直线

  // T5
  addTurnMarker('T5', -20, 0);
  addArcPoints(200, 200, 100, Math.PI, (3 * Math.PI) / 2, false); // 左上弯

  // T4
  addTurnMarker('T4', 0, -20);
  addLinePoints(300, 100); // 向右的直线

  // T2
  addTurnMarker('T2', 20, 0);
  addArcPoints(300, 200, 100, -Math.PI / 2, 0, false); // 右下弯

  // T3
  addTurnMarker('T3', 20, 20);
  addLinePoints(400, 200); // 向右的直线

  // 回到起点
  addArcPoints(400, 100, 100, Math.PI / 2, Math.PI, true); // 左上弯

  graphics.stroke();

  // addLinePoints(300, 305); // 直线段
  // graphics.moveTo(300, 305);
  // addArcPoints(320, 305, 20, Math.PI, 2, true); // 左弯
  // addLinePoints(250, 200);
  // addArcPoints(350, 200, 100, Math.PI, 0, false); // 右弯
  // addLinePoints(450, 300);
  // addLinePoints(450, 400);
  // addArcPoints(350, 400, 100, 0, Math.PI, true); // 下方左弯
  // addLinePoints(250, 500);
  // addArcPoints(150, 500, 100, 0, Math.PI, false); // 返回起点方向
  // addLinePoints(50, 400);
  graphics.stroke();
}

// 每帧更新小球位置
function animateBall() {
  if (pathIndex < path.length) {
    const target = path[pathIndex];
    console.log(pathIndex);
    ball.position.set(target?.x, target?.y);
    // pathIndex++;
  } else {
    // 循环播放
    pathIndex = 0;
  }
  requestAnimationFrame(animateBall);
}

function updateBallPosition(progressValue) {
  if (path.length === 0) return;

  // 限制范围
  progressValue = Math.max(0, Math.min(100, progressValue));

  // 计算路径上的索引
  const index = Math.floor((progressValue / 100) * (path.length - 1));
  const point = path[index];

  // 更新小球位置
  ball.position.set(point.x, point.y);
}

onMounted(() => {
  initPixiAndDrawSuzukaCircuit();
});
</script>

<style scoped>
.pixi-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
