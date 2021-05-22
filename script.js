let age18 = true;
let age45 = false;

let dose1 = true;
let dose2 = false;

let timer;

let userState = "Punjab";
let userDistrict = "Rupnagar";
let userPincodes;
let userData = [000];

let sessionSet = new Set();
let states;
let districts;
let districtId;
let searchDist = true;

const containerApp = document.querySelector("#container_app");
const inbox = document.querySelector("#inbox_msgs");
const stateDropdown = document.querySelector("#state_dropdown");
const distDropdown = document.querySelector("#dist_dropdown");
const btnSubmit = document.querySelector("#submit_area > button");
const attrs = document.getElementsByClassName("attr");
const emptyMsg = document.querySelector("#inbox_msgs > h1");
const formats = document.getElementsByClassName("format");
const forms = document.getElementsByClassName("form");
const pincodes = document.getElementById("pin_value");

const checkAddNotify = function (newSessionSet, age, dose, data) {
  if (sessionSet.has(data.sessionId)) {
    newSessionSet.add(data.sessionId);
    //   console.log("already present");
  } else {
    //   console.log("new slot");
    console.log(data.title, data.dist, data.state, data.pincode);
    console.log(
      data.slots,
      data.slotsDose1,
      data.slotsDose2,
      data.slotDate,
      data.ageLimit
    );

    let html = `<div class="inbox_msg">
    <span> <strong>${age}+</strong> </span>
    <table>
      <tr>
        <th>Date</th>
        <th>Dose</th>
        <th>Slots</th>
        <th>District</th>
        <th>State</th>
        <th>Pincode</th>
      </tr>
      <tr>
        <td>${data.slotDate}</td>
        <td>${dose}</td>
        <td>${data["slotsDose" + dose]}</td>
        <td>${data.dist}</td>
        <td>${data.state}</td>
        <td>${data.pincode}</td>
      </tr>
    </table>
  </div>`;
    emptyMsg.remove();
    inbox.insertAdjacentHTML("afterbegin", html);
    newSessionSet.add(data.sessionId);
    //   console.log([...newSessionSet]);
    const notification = new Notification("New Slots Available", {
      body: `Age Limit :${age}\nDose ${dose}\n${data.state}`,
      icon: "https://image.flaticon.com/icons/png/512/2760/2760383.png",
    });
    notification.onclick = () => {
      window.location.href = "https://www.cowin.gov.in/home";
    };
  }
};

const getSlots = function (distORpins) {
  //   console.clear();
  const newSessionSet = new Set();
  for (const distORpin of distORpins) {
    let date = [
      new Date().getDate(),
      new Date().getMonth() + 1,
      new Date().getFullYear(),
    ].join("-");
    let link;
    if (searchDist) {
      link = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${distORpin}&date=${date}`;
    } else {
      link = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${distORpin}&date=${date}`;
    }
    console.log("requesting data from cowin\nUser data: ", ...distORpins);
    $.get(link, function (data) {
      //   console.log(data.centers[0]);
      data.centers.forEach((center) => {
        // console.log(center);
        const title = center.name;
        const dist = center.district_name;
        const state = center.state_name;
        const pincode = center.pincode;
        // console.log(title, dist, state, pincode);
        center.sessions.forEach((session) => {
          const slots = session.available_capacity;
          const slotsDose1 = session.available_capacity_dose1;
          const slotsDose2 = session.available_capacity_dose2;
          const slotDate = session.date;
          const ageLimit = session.min_age_limit;
          const sessionId = session.session_id;
          //   console.log(slots, slotsDose1, slotsDose2, slotDate, ageLimit);
          const allData = {
            title,
            dist,
            state,
            pincode,
            slots,
            slotsDose1,
            slotsDose2,
            slotDate,
            ageLimit,
            sessionId,
          };
          if (age45) {
            if (dose1) {
              if (ageLimit === 45 && slotsDose1 > 0) {
                // console.log("in if block");
                checkAddNotify(newSessionSet, 45, 1, allData);
              }
            }
            if (dose2) {
              if (ageLimit === 45 && slotsDose2 > 0) {
                // console.log("in if block");
                checkAddNotify(newSessionSet, 45, 2, allData);
              }
            }
          }
          if (age18) {
            if (dose1) {
              if (ageLimit === 18 && slotsDose1 > 0) {
                // console.log("in if block");
                checkAddNotify(newSessionSet, 18, 1, allData);
              }
            }
            if (dose2) {
              if (ageLimit === 18 && slotsDose2 > 0) {
                // console.log("in if block");
                checkAddNotify(newSessionSet, 18, 2, allData);
              }
            }
          }
        });
      });
    }).done(() => {
      sessionSet = new Set([...sessionSet, ...newSessionSet]);
    });
  }
  //   sessionSet = new Set([...newSessionSet]);
  //   console.log(newSessionSet);
  timer = setTimeout(function () {
    getSlots(userData);
  }, 60 * 1000);
};

const initialSettings = function () {
  if (Notification.permission === "granted") {
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        // let not = new Notification("hello");
        console.log(permission);
      } else {
        alert("Allow notifications to get notified");
      }
    });
  } else {
    alert("Allow notifications to get notified");
  }
  containerApp.style.width = screen.width + "px";
  let link = "https://cdn-api.co-vin.in/api/v2/admin/location/states";

  $.get(link, function (data) {
    states = data.states;
    states.forEach((state) => {
      const stateName = state.state_name;
      const html = `<option value="${stateName}">${stateName}</option>`;
      stateDropdown.insertAdjacentHTML("beforeend", html);
    });
  });
  // document.getElementById("container_app").style.width = screen.width + "px";
};
initialSettings();

for (const format of formats) {
  format.addEventListener("click", function () {
    searchDist = !searchDist;
    formats[0].classList.toggle("current_format");
    formats[1].classList.toggle("current_format");
    forms[0].classList.toggle("current_form");
    forms[1].classList.toggle("current_form");
  });
}

stateDropdown.addEventListener("change", function () {
  distDropdown.innerHTML = `<option value="default">Select District</option>`;
  const stateId = states.find((state) => {
    return state.state_name === stateDropdown.value;
  })?.state_id;
  const link = `https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateId}`;
  $.get(link, function (data) {
    districts = data.districts;
    districts.forEach((dist) => {
      const distName = dist.district_name;
      const html = `<option value="${distName}">${distName}</option>`;
      distDropdown.insertAdjacentHTML("beforeend", html);
    });
  });
});

attrs[0].addEventListener("click", function () {
  age18 = !age18;
  attrs[0].classList.toggle("selected_atr");
  console.log(age18);
});
attrs[1].addEventListener("click", function () {
  age45 = !age45;
  attrs[1].classList.toggle("selected_atr");
});
attrs[2].addEventListener("click", function () {
  dose1 = !dose1;
  attrs[2].classList.toggle("selected_atr");
});
attrs[3].addEventListener("click", function () {
  dose2 = !dose2;
  attrs[3].classList.toggle("selected_atr");
});
btnSubmit.addEventListener("click", function (e) {
  e.preventDefault();
  sessionSet = new Set();
  emptyMsg.style.display = "block";
  inbox.innerHTML = "";
  inbox.insertAdjacentElement("afterbegin", emptyMsg);
  if (searchDist === true) {
    if (stateDropdown.value === "default" || distDropdown.value === "default") {
      alert("Enter your state and district");
      return;
    }
    districtId = districts.find((dist) => {
      return dist.district_name === distDropdown.value;
    }).district_id;
    if (age18 === false && age45 === false) {
      age18 = true;
      age45 = true;
    }
    if (dose1 === false && dose2 === false) {
      dose1 = true;
      dose2 = true;
    }
    userData = [districtId];
//     userData = [497, 218];
    if (typeof timer === "number") {
      clearTimeout(timer);
    }
    console.clear();
    getSlots(userData);
  } else {
    userPincodes = pincodes.value.split(" ");
    for (const pin of userPincodes) {
      if (isNaN(pin)) {
        alert("Pincode not valid");
        return;
      }
    }
    userData = userPincodes;
    if (typeof timer === "number") {
      clearTimeout(timer);
    }
    console.clear();
    getSlots(userData);
  }
});
// slotByDist([497, 218]);
// slotByDist([218]);
