// Function to calculate intermediate colors
export function calculateInterpolatedColors(steps, color1, color2) {
    const colors = [];

    for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const interpolatedColor = interpolateColor(color1, color2, ratio);
    colors.push(interpolatedColor);
    }
    return colors;
}

// Function for interpolating between two colors in RGB space
function interpolateColor(color1, color2, ratio) {
    const hexToRgb = hex => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
    });

    const rgbToHex = rgb => `#${Math.round(rgb.r).toString(16).padStart(2, '0')}${Math.round(rgb.g).toString(16).padStart(2, '0')}${Math.round(rgb.b).toString(16).padStart(2, '0')}`;

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    const rgb = {
    r: rgb1.r + (rgb2.r - rgb1.r) * ratio,
    g: rgb1.g + (rgb2.g - rgb1.g) * ratio,
    b: rgb1.b + (rgb2.b - rgb1.b) * ratio,
    };

    return rgbToHex(rgb);
}
