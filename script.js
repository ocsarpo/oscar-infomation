const courses = [
  { id: 1, short: "북악산", mountain: "북악산", difficulty: "중하", route: "창의문 → 혜화문", time: "2시간 30분 ~ 3시간", checkpoint: "백악산 정상 표석" },
  { id: 2, short: "낙산", mountain: "낙산", difficulty: "하", route: "혜화문 → 광희문", time: "1시간 ~ 1시간 30분", checkpoint: "낙산공원 표지판" },
  { id: 3, short: "목멱산", mountain: "목멱산(남산)", difficulty: "하", route: "광희문 → 숭례문", time: "2시간 30분 ~ 3시간", checkpoint: "목멱산 봉수대 터" },
  { id: 4, short: "인왕산", mountain: "인왕산", difficulty: "중하", route: "숭례문 → 창의문", time: "2시간 ~ 2시간 30분", checkpoint: "인왕산 정상 표지판" },
];

const people = [
  { name: "안현섭", courses: [1, 2, 3, 4] },
  { name: "박소연", courses: [3, 4] },
  { name: "전겨레", courses: [3] },
  { name: "비발디", courses: [3] },
  { name: "나용진", courses: [1, 2] },
  { name: "박진현", courses: [4] },
  { name: "정진형", courses: [1, 2] },
];

const tabs = document.querySelector("#courseTabs");
const details = document.querySelector("#courseDetails");
const grid = document.querySelector("#peopleGrid");
const count = document.querySelector("#peopleCount");
let selectedCourse = 1;

function courseLabel(courseId) { return `${courseId}코스`; }

function renderTabs() {
  tabs.innerHTML = courses.map(course => `
    <button class="course-tab" type="button" data-course="${course.id}" aria-selected="${course.id === selectedCourse}">
      <span class="course-number">0${course.id}</span>
      <span class="course-name">${course.short}</span>
      <span class="difficulty">난이도 ${course.difficulty}</span>
    </button>`).join("");
  tabs.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    selectedCourse = Number(button.dataset.course);
    render();
  }));
}

function renderDetails() {
  const course = courses.find(item => item.id === selectedCourse);
  details.innerHTML = `
    <div><p class="route-line"><b>${course.mountain}</b> · ${course.route}</p><p>이 구간의 인증샷 지점은 <b>${course.checkpoint}</b>입니다.</p></div>
    <div class="detail-meta"><span>난이도 ${course.difficulty}</span><span>예상 ${course.time}</span><span>참여 ${people.filter(person => person.courses.includes(course.id)).length}명</span></div>`;
}

function renderPeople() {
  const joining = people.filter(person => person.courses.includes(selectedCourse));
  count.textContent = `${courseLabel(selectedCourse)} 합류 ${joining.length}명`;
  grid.innerHTML = people.map(person => {
    const isFocused = person.courses.includes(selectedCourse);
    const segments = courses.map(course => {
      const active = person.courses.includes(course.id);
      const focusColumn = course.id === selectedCourse;
      const label = active ? `${course.id}코스 합류` : `${course.id}코스 미합류`;
      return `<span class="segment ${active ? "active" : ""} ${focusColumn ? "focus-column" : ""}" aria-label="${label}"></span>`;
    }).join("");
    return `<article class="person-chart ${isFocused ? "focused" : ""}"><div class="person-name">${person.name}</div>${segments}</article>`;
  }).join("");
}

function render() { renderTabs(); renderDetails(); renderPeople(); }
render();

const mapElement = document.querySelector("#naverMap");
const locateButton = document.querySelector("#locateMe");
const locationStatus = document.querySelector("#locationStatus");
let userMarker;

function setLocationStatus(message) {
  locationStatus.textContent = message;
}

function initializeNaverMap() {
  if (!window.naver || !window.naver.maps) {
    setLocationStatus("지도를 불러오지 못했습니다. 네이버 지도 열기에서 경로를 확인해 주세요.");
    return;
  }

  const naverMaps = window.naver.maps;
  const changuimun = new naverMaps.LatLng(37.59245, 126.96672);
  const map = new naverMaps.Map(mapElement, {
    center: new naverMaps.LatLng(37.5755, 126.9875),
    zoom: 12,
    minZoom: 11,
    zoomControl: true,
    zoomControlOptions: { position: naverMaps.Position.TOP_RIGHT },
  });

  const gates = [
    { name: "창의문", detail: "시작 · 완주", position: changuimun },
    { name: "혜화문", detail: "1코스 끝 · 2코스 시작", position: new naverMaps.LatLng(37.58714, 127.00375) },
    { name: "광희문", detail: "2코스 끝 · 3코스 시작", position: new naverMaps.LatLng(37.56404, 127.00962) },
    { name: "숭례문", detail: "3코스 끝 · 4코스 시작", position: new naverMaps.LatLng(37.55998, 126.97528) },
  ];

  gates.forEach((gate) => {
    const marker = new naverMaps.Marker({ map, position: gate.position, title: `${gate.name} · ${gate.detail}` });
    const info = new naverMaps.InfoWindow({ content: `<div class="map-info"><strong>${gate.name}</strong><br><span>${gate.detail}</span></div>` });
    naverMaps.Event.addListener(marker, "click", () => {
      if (info.getMap()) info.close(); else info.open(map, marker);
    });
  });

  const routeColors = ["#c45a38", "#d8952f", "#347663", "#356fa6"];
  const routePaths = window.hanyangRouteSegments || [];
  if (routePaths.length === 4) {
    routePaths.forEach((segment, index) => {
      new naverMaps.Polyline({
        map,
        path: segment.map(([latitude, longitude]) => new naverMaps.LatLng(latitude, longitude)),
        strokeColor: routeColors[index],
        strokeOpacity: 0.9,
        strokeWeight: 5,
        strokeLineCap: "round",
        strokeLineJoin: "round",
      });
    });
  } else {
    setLocationStatus("도보 트랙을 불러오지 못했습니다. 네이버 지도 링크에서 경로를 확인해 주세요.");
  }

  locateButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
      setLocationStatus("이 기기에서는 현재 위치 기능을 지원하지 않습니다.");
      return;
    }
    locateButton.disabled = true;
    setLocationStatus("현재 위치를 확인하는 중입니다. 위치 권한을 허용해 주세요.");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentPosition = new naverMaps.LatLng(position.coords.latitude, position.coords.longitude);
        if (userMarker) userMarker.setPosition(currentPosition);
        else userMarker = new naverMaps.Marker({
          map,
          position: currentPosition,
          title: "현재 위치",
          icon: { content: '<div class="current-location-dot" aria-label="현재 위치"></div>', anchor: new naverMaps.Point(10, 10) },
        });
        map.panTo(currentPosition);
        locateButton.disabled = false;
        setLocationStatus("현재 위치를 지도에 표시했습니다. 위치는 필요할 때 다시 확인할 수 있습니다.");
      },
      (error) => {
        locateButton.disabled = false;
        const errors = {
          1: "위치 권한이 허용되지 않았습니다. 브라우저 설정에서 위치 권한을 허용한 뒤 다시 눌러 주세요.",
          2: "현재 위치를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.",
          3: "위치 확인 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.",
        };
        setLocationStatus(errors[error.code] || "현재 위치를 확인하지 못했습니다. 다시 시도해 주세요.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  });
}

initializeNaverMap();
