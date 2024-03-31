const timestamp = "2023-11-18T18:30:00.000Z";
const dateObject = new Date(timestamp);

const options = { 
  year: "numeric", 
  month: "2-digit", 
  day: "2-digit", 
  hour: "2-digit", 
  minute: "2-digit", 
  hour12: true 
};

const formattedDate = dateObject.toLocaleDateString("en-US", options);
const formattedTime = dateObject.toLocaleTimeString("en-US", options);

const formattedDateTime = `${formattedDate}`;

console.log(formattedDateTime);
