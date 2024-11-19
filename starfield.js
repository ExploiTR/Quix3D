// Variables declaration
let canvas, ctx, width, height, stars = [];
const maxStars = 1000;

function init() {
    stars = [];
    for (let i = 0; i < maxStars; i++) {
        stars.push(new Star());
    }
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);
    stars.forEach(star => {
        star.move();
        star.draw();
    });
    requestAnimationFrame(animate);
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let stars = [];
    const maxStars = 800;

    // Define star colors with higher saturation
    const starColors = [
        'rgba(255, 255, 255, ',  // white
        'rgba(135, 206, 255, ',  // brighter sky blue
        'rgba(255, 255, 180, ',  // brighter yellow
        'rgba(173, 216, 255, ',  // brighter light blue
        'rgba(255, 200, 200, ',  // light red
        'rgba(200, 255, 200, ',  // light green
    ];

    class Star {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.z = Math.random() * 1500;
            this.brightness = Math.random() * 0.9 + 0.5; // Brightness between 0.5 and 1.4
            this.speed = 2; // Slightly faster
            this.color = starColors[Math.floor(Math.random() * starColors.length)];
            this.size = 0;
        }

        move() {
            this.z -= this.speed;
            if (this.z <= 0) {
                this.reset();
            }

            this.screenX = (this.x - width/2) * (800/this.z) + width/2;
            this.screenY = (this.y - height/2) * (800/this.z) + height/2;
            this.size = (1 - this.z/1500) * 7; // Larger stars
        }

        draw() {
            if (this.screenX < 0 || this.screenX > width || 
                this.screenY < 0 || this.screenY > height) {
                return;
            }

            // Create gradient for more realistic star appearance
            const gradient = ctx.createRadialGradient(
                this.screenX, this.screenY, 0,
                this.screenX, this.screenY, this.size
            );
            
            gradient.addColorStop(0, this.color + this.brightness + ')');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.screenX, this.screenY, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Initialize stars
    for (let i = 0; i < maxStars; i++) {
        stars.push(new Star());
    }

    function animate() {
        // Clear screen with more opacity for better trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, width, height);

        stars.forEach(star => {
            star.move();
            star.draw();
        });

        requestAnimationFrame(animate);
    }

    // Start animation
    animate();

    // Handle window resizing
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        
        // Reset stars for new dimensions
        stars = [];
        for (let i = 0; i < maxStars; i++) {
            stars.push(new Star());
        }
    });
});