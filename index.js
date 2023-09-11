const express = require("express");
const app = express();
const dig = require("dialogflow-fulfillment");
const axios = require("axios");

app.get("/", (req, res) => {
  res.send("we are live!!!");
});

app.post("/", express.json(), (req, res) => {
  const agent = new dig.WebhookClient({
    request: req,
    response: res,
  });

  async function getOrderId(agent) {
    // Extract the order ID from the WebhookRequest
    console.log(agent.parameters.number);
    const orderId1 = agent.parameters.number;

    //  POST request to the OrderStatusAPI
    try {
      const response = await axios.post(
        "https://orderstatusapi-dot-organization-project-311520.uc.r.appspot.com/api/getOrderStatus",
        {
          orderId: orderId1,
        }
      );

      if (response.status === 200) {
        const shipmentDate = response.data.shipmentDate;
        const customFormattedDate = convertISODateToCustomFormat(shipmentDate);
        console.log(customFormattedDate);
        agent.add(`Your Order ${orderId1} will be shipped on ${customFormattedDate}`);
      } else {
        agent.add("There was an issue fetching the shipment date.");
      }
    } catch (error) {
        console.log(response.status)
      // Handle any errors that occur during the request
      agent.add("There was an error processing your request.");
    }
  }

  var intentMap = new Map();
  intentMap.set("get-orderID", getOrderId);
  agent.handleRequest(intentMap);
});
function convertISODateToCustomFormat(isoDate) {
  const date = new Date(isoDate);
  const options = {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}
app.listen(3333, () => {
  console.log("listening at port 3333");
});
