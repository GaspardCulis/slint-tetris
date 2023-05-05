#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

use std::time::*;

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = Date, js_name = now)]
    fn date_now() -> f64;
}
#[cfg(target_arch = "wasm32")]
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct Instant(u64);
#[cfg(target_arch = "wasm32")]
impl Instant {
    pub fn now() -> Self {
        Self(date_now() as u64)
    }
    pub fn duration_since(&self, earlier: Instant) -> Duration {
        Duration::from_millis(self.0 - earlier.0)
    }
}

use crate::pieces::{Color, PhysicalPiece, Piece, PIECES, PIECE_COUNT};
use rand::Rng;

pub struct Game {
    grid: [[Option<Color>; Game::GRID_WIDTH as usize]; Game::GRID_HEIGHT as usize],
    current: PhysicalPiece,
    next: Piece,
    held: Option<Piece>,
    has_held: bool,
    score: u32,
    rng: rand::rngs::ThreadRng,
    time: Instant,
    game_over: bool,
}

impl Game {
    pub const GRID_WIDTH: u16 = 10;
    pub const GRID_HEIGHT: u16 = 20;

    pub fn new() -> Game {
        let mut rng = rand::thread_rng();

        Game {
            grid: [[None; Game::GRID_WIDTH as usize]; Game::GRID_HEIGHT as usize],
            current: PhysicalPiece {
                x: Game::GRID_WIDTH as i16 / 2i16 - 2i16,
                y: -1,
                rotation: 0,
                piece: *PIECES[rng.gen_range(0..PIECE_COUNT)],
            },
            next: *PIECES[rng.gen_range(0..PIECE_COUNT)],
            held: None,
            has_held: false,
            score: 0,
            rng,
            time: Instant::now(),
            game_over: false,
        }
    }

    pub fn update(&mut self) {
        let now = Instant::now();
        let delta = now.duration_since(self.time).as_millis();
        if delta > 150 {
            self.tick();
            self.time = now;
        }
    }

    fn tick(&mut self) {
        if self.move_and_collide(PhysicalPiece::newton) {
            if self.boup() {
                self.game_over = true;
            }
            let cleared = self.clear_lines();
            self.score += self.compute_score(cleared);
            self.has_held = false;
        }
    }

    fn hold(&mut self) {
        if self.has_held {
            return;
        } else if self.held.is_none() {
            self.held = Some(self.current.piece);
            self.spawn_new();
        } else {
            let bkp = self.held;
            self.held = Some(self.current.piece);
            self.current = PhysicalPiece {
                x: Game::GRID_WIDTH as i16 / 2 - 2,
                y: -1,
                rotation: 0,
                piece: bkp.unwrap(),
            };
        }
        self.has_held = true;
    }

    pub fn handle_input(&mut self, keycode: char) {
        match keycode {
            'd' | '' => self.move_and_collide(PhysicalPiece::move_right),
            'q' | '' => self.move_and_collide(PhysicalPiece::move_left),
            'z' | '' => self.move_and_collide(PhysicalPiece::rotate_right),
            'c' => self.move_and_collide(PhysicalPiece::rotate_right),
            'x' => self.move_and_collide(PhysicalPiece::rotate_left),
            's' => self.move_and_collide(PhysicalPiece::newton),
            'h' => {
                self.hold();
                true
            }
            ' ' => {
                while !self.move_and_collide(PhysicalPiece::newton) {}
                true
            }
            _ => false,
        };
    }

    fn clear_lines(&mut self) -> u8 {
        let mut cleared = 0u8;
        let width = Game::GRID_WIDTH as usize;
        let height = Game::GRID_HEIGHT as usize;
        let mut y = height;
        while y > 0 {
            y -= 1;
            let row = &self.grid[y];
            let mut x = 0usize;
            while x < width as usize && row[x].is_some() {
                x += 1;
            }
            // If line cleared
            if x == width {
                let mut s_y = y;
                while s_y > 0 {
                    self.grid[s_y] = self.grid[s_y - 1];
                    s_y -= 1;
                }
                cleared += 1 + self.clear_lines();
                y = 0;
            }
        }

        cleared
    }

    fn boup(&mut self) -> bool {
        // Save current piece in grid
        let shape = self.current.get_shape();
        for i in 0..4 {
            let p = shape[i];
            let p_x = self.current.x + p.0 as i16;
            let p_y = self.current.y + p.1 as i16;
            if p_y < 0 {
                return true;
            }
            self.grid[p_y as usize][p_x as usize] = Some(self.current.piece.color);
        }
        self.spawn_new();
        false
    }

    fn spawn_new(&mut self) {
        self.current = PhysicalPiece {
            x: Game::GRID_WIDTH as i16 / 2 - 2,
            y: -1,
            rotation: 0,
            piece: self.next,
        };
        self.next = *PIECES[self.rng.gen_range(0..PIECE_COUNT)];
    }

    /// Returns true if a collison occured
    fn move_and_collide(&mut self, func: fn(&mut PhysicalPiece)) -> bool {
        let mut test_piece = self.current.clone();
        func(&mut test_piece);
        if self.collides(&test_piece) {
            true
        } else {
            func(&mut self.current);
            false
        }
    }

    fn collides(&self, piece: &PhysicalPiece) -> bool {
        let shape = piece.get_shape();
        let mut collision = false;
        let mut s_i = 0;
        while !collision && s_i < 4 {
            let p = shape[s_i];
            let p_x = piece.x + p.0 as i16;
            let p_y = piece.y + p.1 as i16;

            // Check if out of bounds
            if p_x < 0 || p_x >= Game::GRID_WIDTH as i16 || p_y >= Game::GRID_HEIGHT as i16 {
                collision = true;
            } else if p_y >= 0 && self.grid[p_y as usize][p_x as usize].is_some() {
                // Check if grid has some at p_x and p_y
                collision = true;
            }

            s_i += 1;
        }

        collision
    }

    fn compute_score(&self, cleared: u8) -> u32 {
        let score = match cleared {
            0 => 0,
            1 => 40,
            2 => 100,
            3 => 300,
            4 => 1200,
            _ => panic!("Invalid line number"),
        };

        return score;
    }

    pub fn get_grid<'a>(
        &'a self,
    ) -> &'a [[Option<Color>; Game::GRID_WIDTH as usize]; Game::GRID_HEIGHT as usize] {
        &self.grid
    }

    pub fn get_current<'a>(&'a self) -> &'a PhysicalPiece {
        &self.current
    }

    pub fn get_next<'a>(&'a self) -> &'a Piece {
        &self.next
    }

    pub fn get_held<'a>(&'a self) -> &'a Option<Piece> {
        &self.held
    }

    pub fn get_score(&self) -> u32 {
        self.score
    }

    pub fn is_game_over(&self) -> bool {
        self.game_over
    }
}
