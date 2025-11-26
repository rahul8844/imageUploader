import React from 'react';
import './Loader.css';

const Loader: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="loading-container">
      <div className="loader"></div>
      {text ? <p>{text}</p> : null}
    </div>
  )
}

export default Loader;