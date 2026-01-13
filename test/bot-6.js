

  function closeForm() {
  document.getElementById("myForm").style.display = "none";
}

function openForm() {
  document.getElementById("myForm").style.display = "block";
}

function send() {
  const form = document.getElementById("myForm");
  console.log(form);
  console.log(form.getElementsByTagName("textarea")[0]);
  console.dir(form.getElementsByTagName("textarea")[0]);

  let request = form.getElementsByTagName("textarea")[0].value;
  messages = document.getElementById("messages");

  const requestElement = document.createElement("div");
  let requestTextNode = document.createTextNode(request);
  requestElement.className = "request";
  requestElement.appendChild(requestTextNode);
  messages.appendChild(requestElement);

  fetch("http://localhost:3000/chat/6", {
    method: "POST",
    body: JSON.stringify({ requestMessage: request }),
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      let responseMessage = data.message;

      const responseTextNode = document.createTextNode(responseMessage);
      let responseElement = document.createElement("div");
      responseElement.appendChild(responseTextNode);
      requestElement.className = "response";

      messages.appendChild(responseElement);
    })
    .catch((err) => {
      console.log("the error catched is ", err);
    });
}

function setTheme(clientTheme) {
  Object.entries(clientTheme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value);
  });
}

setTheme({
  "primary-color": "#0055AA",
  "secondary-color": "#FFFFFF",
});




  