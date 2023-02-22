import { useState } from "react";
import Dropdown from "./Dropdown";

export default function App() {
  let [text, setText] = useState("Select an item");

  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="mx-auto w-full max-w-sm overflow-hidden rounded-md border border-gray-300 bg-white">
        <header className="border-b border-gray-100 p-2">
          <Dropdown>
            <Dropdown.Button></Dropdown.Button>

            <Dropdown.Menu>
              <Dropdown.MenuItem onSelect={() => setText("Clicked Item 1")}>
                Item 1
              </Dropdown.MenuItem>
              <Dropdown.MenuItem onSelect={() => setText("Clicked Item 2")}>
                Item 2
              </Dropdown.MenuItem>
              <Dropdown.MenuItem onSelect={() => alert(";)")}>
                Item 3
              </Dropdown.MenuItem>
            </Dropdown.Menu>
          </Dropdown>
        </header>
        <div className="px-6 py-8 text-right">
          <p>{text}</p>
        </div>
      </div>
    </div>
  );
}
