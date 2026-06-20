import pLimit from "p-limit";
const notionLimit = pLimit(3); 

export default notionLimit;
