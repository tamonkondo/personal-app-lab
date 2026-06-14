import pLimit from "p-limit";
const notionLimit = pLimit(5); 

export default notionLimit;
