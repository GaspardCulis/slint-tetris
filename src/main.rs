use std::{rc::Rc, cell::RefCell, time::Duration};

use game::Game;
use slint::{SharedString, Timer};

mod game;
mod pieces;
mod controller {
    pub mod game_controller;
}
use controller::*;

pub mod ui {
    slint::include_modules!();
}
use ui::*;

fn main() -> Result<(), slint::PlatformError> {
    let ui = AppWindow::new()?;
    let game = Rc::new(RefCell::new(Game::new()));

    let _game_controller = game_controller::setup(&ui, game.clone());
 
    let game_handle = game.clone();
    let game_update_timer = Timer::default();
    game_update_timer.start(slint::TimerMode::Repeated, Duration::from_millis(30), {
        move || {
            game_handle.borrow_mut().update();
        }
    });
    
    let game_handle = game.clone();
    ui.on_key_pressed(move |key_text: SharedString| {
        let keycode = key_text.as_str().chars().nth(0).unwrap();
        let mut game = game_handle.borrow_mut();
        game.handle_input(keycode);
    });

    ui.run()
}
