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
