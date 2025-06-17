import { computed, defineComponent, nextTick, onMounted, ref, toRefs, VNode, watchEffect } from 'vue';
import Track from './track';

interface SubComponent extends SVGElement {
  trackSVGRef: SVGElement;
  trackPathRef: SVGPathElement;
}

interface CarPosition {
  [k: number]: {
    progress: number;
  };
}

interface CarProgress {
  progress: number; // 百分比进度，范围 0~1
}

interface CarState {
  progress: number; // 当前进度 [0~1]
  active: boolean; // 是否已启动
  intervalId?: number; // 动画帧 ID
}
export default defineComponent({
  name: 'RacingMap',
  props: {
    total: {
      type: Number,
      default: 5,
    },
  },
  emits: ['initCarPosition'],
  setup(props, { emit }) {
    const { total } = toRefs(props);
    const index = ref(0); // 当前路径段起点索引

    const trackRef = ref<SubComponent>();

    const pathPointsArray = ref([]);
    const pathPointLimit = ref(528 * 2);

    const carPositionMaps = ref<Record<number, CarProgress>>({});

    const carElements = ref<Record<number, SVGElement>>({});

    const carStates = ref<Record<number, CarState>>({});

    /**
     * 生成路径上的离散点坐标
     * @param {SVGPathElement} el - 需要解析的SVG路径元素
     * @param {number} step - 路径采样步长，单位：像素
     * @returns {Array<{x: number, y: number}>} 路径离散点坐标数组
     */
    const generatePoints = (el: SVGPathElement, step = 1) => {
      if (typeof step !== 'number' || step <= 0) {
        throw new Error('step must be a positive number');
      }
      const totalLength = el.getTotalLength();
      const points = [];
      // 按步长遍历路径总长度生成坐标点
      for (let i = 0; i < totalLength; i += step) {
        const point = el.getPointAtLength(i);
        points.push({ x: point.x, y: point.y });
      }
      // 确保包含路径终点
      const endPoint = el.getPointAtLength(totalLength);
      if (
        points.length === 0 ||
        points[points.length - 1].x !== endPoint.x ||
        points[points.length - 1].y !== endPoint.y
      ) {
        points.push({ x: endPoint.x, y: endPoint.y });
      }

      return points;
    };

    /**
     * 根据进度百分比获取路径上的坐标点
     * @param percent - 进度百分比 (0 ~ 1)
     * @returns {x, y} 坐标点
     */
    const getPointByPercent = (percent: number) => {
      if (!pathPointsArray.value.length || pathPointsArray.value.length < 2) {
        console.warn('路径点数组未正确生成');
        return { x: 0, y: 0 };
      }
      const index = Math.min(Math.floor(percent * pathPointLimit.value), pathPointLimit.value);
      return pathPointsArray.value[index];
    };

    // 获取路径 生成路径点
    // const getTrackPath = () => {
    //   const pathElement = trackRef.value.trackPathRef;
    //   if (!pathElement) return;
    //   pathPointsArray.value = generatePoints(pathElement);
    //   pathPointLimit.value = pathPointsArray.value.length - 1;
    //   console.log('pathPointsArray', pathPointsArray.value);
    // };

    const initCarStates = () => {
      carStates.value = {};
      for (let i = 0; i < props.total; i++) {
        carStates.value[i] = {
          progress: 0,
          active: false,
        };
      }
    };

    onMounted(() => {
      nextTick(() => {
        getTrackPath();
        renderCar();
        initCarStates(); // 初始化状态
      });
    });

    // 渲染车辆，追加到trackRef里
    const renderCar = () => {
      const svgElement = trackRef.value?.trackSVGRef;
      if (!svgElement) return;

      for (let i = 0; i < props.total; i++) {
        const point = pathPointsArray.value[i % pathPointsArray.value.length];

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', point.x.toString());
        circle.setAttribute('cy', point.y.toString());
        circle.setAttribute('r', '15');
        circle.setAttribute('fill', 'green');
        circle.setAttribute('data-id', i.toString());

        svgElement.appendChild(circle);
        carElements.value[i] = circle;

        // 初始化 carPositionMaps
        carPositionMaps.value[i] = { progress: i / props.total };
      }
    };

    watchEffect(() => {
      for (const id in carStates.value) {
        const { progress } = carStates.value[id];
        const point = getPointByPercent(progress);
        const circle = carElements.value[id];

        if (circle) {
          circle.setAttribute('cx', point.x.toString());
          circle.setAttribute('cy', point.y.toString());
        }
      }
    });

    const simulateMovement = () => {
      for (let i = 0; i < props.total; i++) {
        const delay = i * 5000;
        const id = i;

        setTimeout(() => {
          startCar(id);
        }, delay);
      }
    };

    const pathLength = ref(0);

    const getTrackPath = () => {
      const pathElement = trackRef.value.trackPathRef;
      if (!pathElement) return;

      pathLength.value = pathElement.getTotalLength();
      pathPointsArray.value = generatePoints(pathElement);
      pathPointLimit.value = pathPointsArray.value.length - 1;
    };

    const dynamicSpeed = computed(() => {
      return 1 / (pathLength.value / 10); // 每10像素移动1%进度
    });

    const startCar = (id: number) => {
      const state = carStates.value[id];
      if (!state || state.active) return;

      state.active = true;
      carStates.value[id] = state;

      let lastTime = 0;

      const animate = (timestamp: number) => {
        if (!lastTime) lastTime = timestamp;
        const deltaTime = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        let progress = carStates.value[id]?.progress || 0;
        progress = (progress + dynamicSpeed.value * deltaTime) % 1;

        carStates.value[id] = {
          ...carStates.value[id],
          progress,
        };

        carStates.value[id].intervalId = requestAnimationFrame(animate);
      };

      carStates.value[id].intervalId = requestAnimationFrame(animate);
    };

    const initCarPosition = (id: number) => {
      const state = carStates.value[id];
      if (!state) return;

      if (state.intervalId) {
        cancelAnimationFrame(state.intervalId);
      }

      carStates.value[id] = {
        progress: 0,
        active: false,
      };
    };

    // defineExpose({ initCarPosition });

    return () => (
      <>
        <Track ref={trackRef} />
        <t-button onClick={simulateMovement}>move</t-button>
      </>
    );
  },
});
