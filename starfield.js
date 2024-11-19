// Star class definition remains the same
class Star {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 1500;
        this.brightness = Math.random();
        this.speed = 2;
    }
    move() {
        this.z -= this.speed;
        if (this.z <= 0) {
            this.reset();
        }
        this.screenX = (this.x - width/2) * (800/this.z) + width/2;
        this.screenY = (this.y - height/2) * (800/this.z) + height/2;
        this.size = (1 - this.z/1500) * 5;
    }
    draw() {
        if (this.screenX < 0 || this.screenX > width || 
            this.screenY < 0 || this.screenY > height) {
            return;
        }
        const gradient = ctx.createRadialGradient(
            this.screenX, this.screenY, 0,
            this.screenX, this.screenY, this.size
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.brightness})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.screenX, this.screenY, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

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

    // Define star colors
    const starColors = [
        'rgba(255, 255, 255, ',  // white
        'rgba(135, 206, 235, ',  // sky blue
        'rgba(255, 255, 224, ',  // light yellow
        'rgba(173, 216, 230, ',  // light blue
    ];

    class Star {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.z = Math.random() * 1500;
            this.brightness = Math.random() * 0.8 + 0.2; // Brightness between 0.2 and 1
            this.speed = 0.4;
            this.color = starColors[Math.floor(Math.random() * starColors.length)];
        }

        move() {
            this.z -= this.speed;
            if (this.z <= 0) {
                this.reset();
            }

            this.screenX = (this.x - width/2) * (800/this.z) + width/2;
            this.screenY = (this.y - height/2) * (800/this.z) + height/2;
            this.size = (1 - this.z/1500) * 2;
        }

        draw() {
            if (this.screenX < 0 || this.screenX > width || 
                this.screenY < 0 || this.screenY > height) {
                return;
            }
            ctx.fillStyle = this.color + this.brightness + ')';
            ctx.beginPath();
            ctx.arc(this.screenX, this.screenY, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < maxStars; i++) {
        stars.push(new Star());
    }

    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);

        stars.forEach(star => {
            star.move();
            star.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
});