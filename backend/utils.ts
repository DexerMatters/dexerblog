export function log(message: string) {
  let newMessage = "";
  let message_ = message.split("\n")
  message_.forEach((line, i) => {
    if (i === 0) {
      newMessage += `[${new Date().toISOString()}] ${line}`;
    } else {
      newMessage += `\t\t${line}`;
    }
    if (i !== message_.length - 1) {
      newMessage += "\n";
    }
  });
  console.log(newMessage);
}

export function error(message: string) {
  let newMessage = "";
  let message_ = message.split("\n")
  message_.forEach((line, i) => {
    if (i === 0) {
      newMessage += `[${new Date().toISOString()}] ERROR: ${line}`;
    } else {
      newMessage += `\t\t${line}`;
    }
    if (i !== message_.length - 1) {
      newMessage += "\n";
    }
  });
  console.error(newMessage);
}