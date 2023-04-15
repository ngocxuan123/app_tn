import React from 'react';
import { createRoot } from 'react-dom/client';
import WindowFrame from '@misc/window/components/WindowFrame';
import Application from '@components/Application';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Application {...(window as any).electronAPI} />,
  },
]);

// Application to Render
const app = (
  <WindowFrame title='Textnow' platform='windows'>
     <Application {...(window as any).electronAPI} />
  </WindowFrame>
);

// Render application in DOM
createRoot(document.getElementById('app')).render(app);
