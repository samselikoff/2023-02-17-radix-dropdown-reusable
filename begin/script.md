# Script

## Step 1

```diff
  <DropdownMenu.Content
    align="start"
    className="bg-white/50 backdrop-blur rounded text-left p-2 shadow mt-1"
+   asChild
  >
```

see error, add div, make it motion.div

add mount animation:

```jsx
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
```

Works!

But, want exit animation. If you've used FM motion before you know we need an animate presence for this, along with a conditionally rendered motion.div.

So, let's wrap this whole thing in animate presence. Currently conditional rendering being handled internally by lib but we need to handle it outselves. Turns out a lot of these components have a `forceMount` prop. Now it's always rendered.

How gonna control it? New `open` var.

```
{open && (

)}
```

Where does this come from? Right now it's what you might hear of as an "uncontrolled component". The open state is tucked away in this Root component. But we can opt into controlling it with open and onOpenChange.

So let's create some state

```jsx
const [open, setOpen] = useState(false);

<DropdownMenu.Root open={open} onOpenChange={setOpen}>
```

Check it out – exit animations. On click away, on escape, on select, on click, on enter... so cool!

## 🟢 Step

Next, I want to add a highlight animation to the menu item. When clicking, like Mac OS.

Come down to dropdown menu item:

```jsx
<DropdownMenu.Item
  onSelect={() => {
    onSelect();
  }}
```

First step is to prevent the auto closing, so we have a chance to animate. Do this with prevent default

```jsx
onSelect={(e) => {
  e.preventDefault();
  onSelect();
}}
```

Now to animate. Don't use initial / animate / exit bc it's not about this component lifecycle. We want to start an animation when we click. For this we need to drop down one level to useAnimationControls.

```
let controls = useAnimationControls();
```

To use these we need a motion.div. Create it, move classes down. data-highlight doesn't work and we've introduced a new div. Use asChild to forward everything. now works.

Ok, so we don't want to fade it out, we want to highlight it.

```jsx
controls.start({
  backgroundColor: "var(--white)",
  color: "var(--gray-700)",
  transition: { duration: 0.1 },
});
```

Ok, back to blue to make it blink

```
controls.start({
  backgroundColor: "var(--sky-400)",
  color: "var(--white)",
  transition: { duration: 0.1 },
});
```

Now this is where the magic happens. Controls.start returns a promise. So we await.

Now it's blinking!

Need to close menu manually. Pass it in from parent.

```jsx
function closeMenu() {
  setOpen(false);
}

onSelect={async (e) => {
  e.preventDefault();
  await controls.start({
    backgroundColor: "var(--white)",
    color: "var(--gray-700)",
    transition: { duration: 0.1 },
  });
  await controls.start({
    backgroundColor: "var(--sky-400)",
    color: "var(--white)",
    transition: { duration: 0.1 },
  });
  closeMenu();
  onSelect();
}}
```

Getting closer... menu doesn't quite finish closing in time. And if we try the third item, we see the alert shows up before the menu finishes closing.

Look at Mac OS menu. Need to await the menu close if we want it to animate out.

useAnimationControls in parent.

```jsx
<motion.div
  initial={{ opacity: 0 }}
  animate={controls}
  exit={{ opacity: 0 }}
>
```

Now once we replace animate with animate={controls} the menu doesn't open anymore – we need to imperatively animate the opacity to 0 using the controls when the menu becomes open.

First instinct might be to run it here on onOpenChange

```jsx
onOpenChange={() => {
  setOpen(true);
  controls.start({ opacity: 1 });
}}
```

Doesn't work. Problem is can't run animation until after menu mounts.

Instead, we can leave open and onOpenChange, and use an effect to kick off our mount animation.

```jsx
useEffect(() => {
  if (open) {
    controls.start({ opacity: 1 });
  }
}, [controls, open]);
```

Cool! Menu is opening, and we still have initial and exit working for us to take care of initial state and the exit animation.

Now that we've refactored our menu to use animation controls, we can make our closeMenu function async.

```jsx
async function closeMenu() {
  await controls.start({ opacity: 0 });
  setOpen(false);
}
```

and await it in our Item

```
await closeMenu();
```

Check it out. All three menu items work!

Now for the fun part: refactoring + tweaking these transitions.

First we have some animation code up here and ssome down here, let's refactor to variants.

```jsx
<motion.div
  initial="closed"
  animate={controls}
  exit="closed"
  variants={{
    open: { opacity: 1 },
    closed: { opacity: 0 },
  }}
>

async function closeMenu() {
  await controls.start("closed");
  setOpen(false);
}
```

Next some easing and timing

```jsx
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
```

Next come down to item.

```jsx
const sleep = (s: number) =>
  new Promise((resolve) => setTimeout(resolve, s * 1000));
```

Duration .04, await sleep

```jsx
await sleep(0.075);
```

## Diff

```diff
diff --git a/src/App.tsx b/src/App.tsx
index 06578d4..ceaf36d 100644
--- a/src/App.tsx
+++ b/src/App.tsx
@@ -1,28 +1,78 @@
 import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
-import { ReactNode, useState } from "react";
+import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
+import { ReactNode, useEffect, useState } from "react";

 export default function App() {
+  let [open, setOpen] = useState(false);
   let [text, setText] = useState("Select an item");
+  let controls = useAnimationControls();
+
+  useEffect(() => {
+    if (open) {
+      controls.start("open");
+    }
+  }, [open, controls]);
+
+  async function closeMenu() {
+    await controls.start("closed");
+    setOpen(false);
+  }

   return (
     <div className="flex items-center justify-center min-h-full">
       <div className="max-w-sm mx-auto bg-white border border-gray-300 rounded-md overflow-hidden w-full">
         <header className="border-b border-gray-100 p-2">
-          <DropdownMenu.Root>
+          <DropdownMenu.Root open={open} onOpenChange={setOpen}>
             <DropdownMenu.Trigger className="px-4 py-1 rounded select-none data-[state=open]:bg-gray-200/75 focus-visible:outline-none hover:bg-gray-200/50 cursor-default">
               File
             </DropdownMenu.Trigger>

-            <DropdownMenu.Portal>
-              <DropdownMenu.Content
-                align="start"
-                className="bg-white/50 backdrop-blur rounded text-left p-2 shadow mt-1"
-              >
-                <Item onClick={() => setText("Clicked Item 1")}>Item 1</Item>
-                <Item onClick={() => setText("Clicked Item 2")}>Item 2</Item>
-                <Item onClick={() => alert("hi")}>Item 3</Item>
-              </DropdownMenu.Content>
-            </DropdownMenu.Portal>
+            <AnimatePresence>
+              {open && (
+                <DropdownMenu.Portal forceMount>
+                  <DropdownMenu.Content align="start" asChild>
+                    <motion.div
+                      initial="closed"
+                      animate={controls}
+                      exit="closed"
+                      variants={{
+                        open: {
+                          opacity: 1,
+                          transition: {
+                            ease: "easeOut",
+                            duration: 0.1,
+                          },
+                        },
+                        closed: {
+                          opacity: 0,
+                          transition: {
+                            ease: "easeIn",
+                            duration: 0.1,
+                          },
+                        },
+                      }}
+                      className="bg-white/50 backdrop-blur rounded text-left p-2 shadow mt-1"
+                    >
+                      <Item
+                        onClick={() => setText("Clicked Item 1")}
+                        closeMenu={closeMenu}
+                      >
+                        Item 1
+                      </Item>
+                      <Item
+                        onClick={() => setText("Clicked Item 2")}
+                        closeMenu={closeMenu}
+                      >
+                        Item 2
+                      </Item>
+                      <Item onClick={() => alert("hi")} closeMenu={closeMenu}>
+                        Item 3
+                      </Item>
+                    </motion.div>
+                  </DropdownMenu.Content>
+                </DropdownMenu.Portal>
+              )}
+            </AnimatePresence>
           </DropdownMenu.Root>
         </header>
         <div className="px-6 py-8">
@@ -33,19 +83,42 @@ export default function App() {
   );
 }

+const sleep = (s: number) =>
+  new Promise((resolve) => setTimeout(resolve, s * 1000));
+
 function Item({
   children,
   onClick = () => {},
+  closeMenu,
 }: {
   children: ReactNode;
   onClick?: () => void;
+  closeMenu: () => void;
 }) {
+  let controls = useAnimationControls();
+
   return (
     <DropdownMenu.Item
-      onSelect={onClick}
+      asChild
+      onSelect={async (e) => {
+        e.preventDefault();
+        await controls.start({
+          backgroundColor: "var(--white)",
+          color: "var(--gray-700)",
+          transition: { duration: 0.04 },
+        });
+        await controls.start({
+          backgroundColor: "var(--sky-400)",
+          color: "var(--white)",
+          transition: { duration: 0.04 },
+        });
+        await sleep(0.075);
+        await closeMenu();
+        onClick();
+      }}
       className="text-gray-700 w-40 px-2 py-1.5 data-[highlighted]:bg-sky-400 data-[highlighted]:text-white data-[highlighted]:focus:outline-none select-none rounded"
     >
-      {children}
+      <motion.div animate={controls}>{children}</motion.div>
     </DropdownMenu.Item>
   );
 }
```
