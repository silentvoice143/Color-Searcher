import React, { useEffect, useRef, useState } from "react";
import "./ColorSearcher.css";

function ColorSearcher() {
  const [color_to_search, setColor_to_search] = useState("");
  const [buttonClicked, setButtonClicked] = useState("");
  const [colorData, setColorData] = useState([]);
  const [colors, setColors] = useState([]);

  const [Loading, setLoading] = useState(true);

  const inputRef = useRef(null);

  // Function to convert HEX to RGB
  const hexToRgb = (hex) => {
    hex = hex.replace(/^#/, "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
  };

  // Function to convert HEX to HSL
  const hexToHsl = (hex) => {
    hex = hex.replace(/^#/, "");
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      if (max === r) {
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
      } else if (max === g) {
        h = ((b - r) / d + 2) * 60;
      } else {
        h = ((r - g) / d + 4) * 60;
      }
    }
    return `${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
  };

  useEffect(() => {
    const getColor = async () => {
      try {
        // console.log("getting all colors");
        const response = await fetch(
          "https://raw.githubusercontent.com/NishantChandla/color-test-resources/main/xkcd-colors.json"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const jsonData = await response.json();
        const colorsWithRgbHsl = jsonData.colors.map((color) => ({
          ...color,
          rgb: hexToRgb(color.hex),
          hsl: hexToHsl(color.hex),
        }));
        setColors(colorsWithRgbHsl);
        setColorData(colorsWithRgbHsl);
        setLoading(false);
        // console.log(jsonData);
      } catch (err) {
        alert(err);
      }
    };

    getColor();
  }, []);

  const isHexColor = (color) => {
    return /^#[0-9A-F]{6}$/i.test(color);
  };

  const isRgbColor = (color) => {
    return /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.test(color);
  };

  const handleClick = () => {
    // console.log(color_to_search);
    let inputcolor;

    if (isHexColor(color_to_search)) {
      //   console.log("hex");
      inputcolor = hexToRgb(color_to_search);
    } else if (isRgbColor(color_to_search)) {
      //destructuring
      const match = color_to_search.match(
        /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i
      );
      if (match) {
        const [, r, g, b] = match; // Destructure the matched values

        inputcolor = { r: parseInt(r), g: parseInt(g), b: parseInt(b) };
      }
      //   console.log("rgb");
    } else {
      alert("Invalid color");
      return;
    }

    setButtonClicked(true);
    console.log(inputcolor);
    const data = filterClosestColors(inputcolor, colorData);

    setColors(data);
  };

  // Function to calculate the distance between two colors
  function colorDistance(rgb1, rgb2) {
    // Calculate the Euclidean distance between RGB colors
    return Math.sqrt(
      Math.pow(rgb2.r - rgb1.r, 2) +
        Math.pow(rgb2.g - rgb1.g, 2) +
        Math.pow(rgb2.b - rgb1.b, 2)
    );
  }

  // Function to filter 100 closest colors
  function filterClosestColors(input, colorData) {
    // Calculate distances and sort colors

    const distances = colorData.map((color) => ({
      color: color.color,
      hex: color.hex,
      rgb: color.rgb,
      hsl: color.hsl,
      distance: colorDistance(input, hexToRgb(color.hex)),
    }));
    distances.sort((a, b) => a.distance - b.distance);

    return distances.slice(0, 100);
  }

  return (
    <div>
      <h1>ColorSearcher</h1>
      <div className="search-container">
        <input
          type="color"
          name="color"
          id=""
          value={color_to_search}
          onChange={(e) => {
            setColor_to_search(e.target.value);
          }}
          onBlur={() => {
            inputRef.current.focus();
          }}
        />
        <input
          className="inputBox"
          type="text"
          name="color"
          id=""
          ref={inputRef}
          placeholder="Type Hexvalue"
          value={color_to_search}
          onChange={(e) => {
            setColor_to_search(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleClick();
            }
          }}
        />
        <button
          className="searchBtn"
          onClick={() => {
            setColors(colorData);
            setButtonClicked(false);
          }}
        >
          Show all colors
        </button>
      </div>
      <div className="color-container">
        {buttonClicked ? (
          <h2>Result for {color_to_search} ..</h2>
        ) : (
          <h2>All Colors</h2>
        )}
        <div className="color-list">
          {Loading ? (
            <p>Loading...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Hex</th>
                  <th>RGB</th>
                  <th>HSL</th>
                </tr>
              </thead>
              <tbody>
                {colors.map((color, index) => (
                  <tr key={index}>
                    <td className="color-name-container">
                      <div
                        className="colorbox"
                        style={{ backgroundColor: color.hex }}
                      ></div>
                      <div>{color.color}</div>
                    </td>
                    <td>{color.hex}</td>
                    <td>
                      {color.rgb.r},{color.rgb.g},{color.rgb.b}
                    </td>
                    <td>{color.hsl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ColorSearcher;
