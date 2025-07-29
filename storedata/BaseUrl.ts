import axios from "axios";


const BaseUrl=axios.create({
  baseURL: 'https://apiscoreboard.codedonor.in/api',
  headers:{
    "Content-type":"application/json",
  }
});

export { BaseUrl };
