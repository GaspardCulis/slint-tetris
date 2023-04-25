use game::Game;
use slint::PhysicalSize;

mod pieces;
mod game;
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
    let game = Game::new();

    let _game_controller = game_controller::setup(&ui, game);
    
    let ui_handle = ui.as_weak();

    ui.run()
}
