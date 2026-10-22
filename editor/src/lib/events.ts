/** Parses a server-sent event stream fed in arbitrary chunks. */
export function createEventParser(
  receive: (event: string, data: string) => void,
): (chunk: string) => void {
  let buffer = "";
  return (chunk) => {
    buffer += chunk.replaceAll("\r\n", "\n");
    for (
      let end = buffer.indexOf("\n\n");
      end >= 0;
      end = buffer.indexOf("\n\n")
    ) {
      const block = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      let event = "message";
      const data: string[] = [];
      for (const line of block.split("\n")) {
        if (!line || line.startsWith(":")) continue;
        const colon = line.indexOf(":");
        const field = colon < 0 ? line : line.slice(0, colon);
        const value = colon < 0 ? "" : line.slice(colon + 1).replace(/^ /, "");
        if (field === "event") event = value;
        if (field === "data") data.push(value);
      }
      if (data.length) receive(event, data.join("\n"));
    }
  };
}
