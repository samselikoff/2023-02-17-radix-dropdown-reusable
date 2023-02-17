import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import colors from "tailwindcss/colors";

export default function App() {
  let [text, setText] = useState("Select an item");
  let [open, setOpen] = useState(false);
  let controls = useAnimationControls();

  async function closeMenu() {
    await controls.start("closed");
    setOpen(false);
  }

  useEffect(() => {
    if (open) {
      controls.start("open");
    }
  }, [controls, open]);

  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="mx-auto w-full max-w-sm overflow-hidden rounded-md border-gray-300 bg-white">
        <header className="border-b border-gray-100 p-2">
          <DropdownMenu.Root open={open} onOpenChange={setOpen}>
            <DropdownMenu.Trigger className="cursor-default select-none rounded px-4 text-2xl hover:bg-gray-200/50 focus-visible:outline-none data-[state=open]:bg-gray-200/75">
              
            </DropdownMenu.Trigger>

            <AnimatePresence>
              {open && (
                <DropdownMenu.Portal forceMount>
                  <DropdownMenu.Content
                    align="start"
                    className="mt-1 overflow-hidden rounded bg-white/75 text-left shadow backdrop-blur"
                    asChild
                  >
                    <motion.div
                      initial="closed"
                      animate={controls}
                      exit="closed"
                      variants={{
                        open: {
                          opacity: 1,
                          transition: {
                            ease: "easeOut",
                            duration: 0.1,
                          },
                        },
                        closed: {
                          opacity: 0,
                          transition: {
                            ease: "easeIn",
                            duration: 0.2,
                          },
                        },
                      }}
                    >
                      <div className="p-2">
                        <Item
                          closeMenu={closeMenu}
                          onSelect={() => setText("Clicked Item 1")}
                        >
                          Item 1
                        </Item>
                        <Item
                          closeMenu={closeMenu}
                          onSelect={() => setText("Clicked Item 2")}
                        >
                          Item 2
                        </Item>
                        <Item
                          closeMenu={closeMenu}
                          onSelect={() => alert(";)")}
                        >
                          Item 3
                        </Item>
                      </div>
                    </motion.div>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              )}
            </AnimatePresence>
          </DropdownMenu.Root>
        </header>
        <div className="px-6 py-8 text-right">
          <p>{text}</p>
        </div>
      </div>
    </div>
  );
}

function Item({
  children,
  onSelect = () => {},
  closeMenu,
}: {
  children: ReactNode;
  onSelect?: () => void;
  closeMenu: () => void;
}) {
  let controls = useAnimationControls();

  return (
    <DropdownMenu.Item
      asChild
      onSelect={async (e) => {
        e.preventDefault();
        await controls.start({
          backgroundColor: `${colors.sky[400]}00`,
          color: colors.gray[700],
          transition: { duration: 0.05 },
        });
        await controls.start({
          backgroundColor: colors.sky[400],
          color: colors.white,
          transition: { duration: 0.05 },
        });
        await sleep(0.075);
        await closeMenu();
        onSelect();
      }}
    >
      <motion.div
        animate={controls}
        className="w-40 cursor-default select-none rounded px-2 py-1.5 text-gray-700 data-[highlighted]:bg-sky-400 data-[highlighted]:text-white data-[highlighted]:focus:outline-none"
      >
        {children}
      </motion.div>
    </DropdownMenu.Item>
  );
}

const sleep = (s: number) =>
  new Promise((resolve) => setTimeout(resolve, s * 1000));
