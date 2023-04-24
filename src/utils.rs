pub struct Vector2 {
    x: i32,
    y: i32
}

impl Vector2 {
    fn new(x: i32, y: i32) -> Self {
        Vector2 {x, y}
    }
}

impl Vector2 {
    pub fn add(self, other: Self) -> Self {
        Vector2 {
            x: self.x + other.x,
            y: self.y + other.y
        }
    }

    pub fn sub(self, other: Self) -> Self {
        Vector2 {
            x: self.x - other.x,
            y: self.y - other.y
        }
    }
}

