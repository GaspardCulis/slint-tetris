use game::Game;
use slint::{PhysicalSize, SharedString};
use std::cell::RefCell;

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
    let game = RefCell::new(Game::new());

    let _game_controller = game_controller::setup(&ui, game);

    ui.on_key_pressed(move |key_text: SharedString| {
        let ui = ui_handle.unwrap();
        println!("{}", key_text.as_str());
    });

    ui.run()
}
