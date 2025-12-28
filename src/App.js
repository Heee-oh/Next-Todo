import React, { useState, useEffect } from 'react';
import MainApp from './MainApp';
import Widget from './Widget';
import './App.css';

const App = () => {
  const [route, setRoute] = useState(window.location.hash.substr(1));

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash.substr(1));
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  let Component;
  switch (route) {
    case '/widget':
      Component = MainApp;
      break;
    default:
      Component = MainApp;
  }

  return <Component />;
};

export default App;
