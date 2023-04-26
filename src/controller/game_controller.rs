use crate::{ui::*, game::Game, pieces};
use std::time::Duration;
use slint::*;

pub fn setup(window: &AppWindow, game: Game) -> Timer {
    window.global::<GameGridAdapter>().set_grid_size(Size { height: Game::GRID_HEIGHT.into(), width: Game::GRID_WIDTH.into() });

    let update_timer = Timer::default();
    update_timer.start(TimerMode::Repeated, Duration::from_millis(40), {
        let weak_window = window.as_weak();

        move || {
            update_ui(&weak_window.unwrap().global::<GameGridAdapter>(), &game);
        }
    });

    update_timer
}

fn update_ui(game_grid_adapter: &GameGridAdapter, game: &Game) {
    let vec = VecModel::<VecModel<slint::Color>>::default();
    for i in 0..Game::GRID_HEIGHT {
        let row = VecModel::<Color>::default();
        for j in 0..Game::GRID_WIDTH {
            row.insert(j.into(), col2col( game.get_grid()[i as usize][j as usize] ));
        }
    }
}

fn col2col(color: Option<pieces::Color>) -> slint::Color {
    match color {
        Some(pieces::Color::CYAN) => slint::Color::from_rgb_u8(0, 255, 255), 
        Some(pieces::Color::BLUE) => slint::Color::from_rgb_u8(0, 0, 255), 
        Some(pieces::Color::ORANGE) => slint::Color::from_rgb_u8(255, 165, 0),
        Some(pieces::Color::YELLOW) => slint::Color::from_rgb_u8(255, 255, 0),
        Some(pieces::Color::GREEN) => slint::Color::from_rgb_u8(0, 255, 0),
        Some(pieces::Color::PURPLE) => slint::Color::from_rgb_u8(128, 0, 128),
        Some(pieces::Color::RED) => slint::Color::from_rgb_u8(255, 0, 0),
        None => slint::Color::from_argb_u8(0, 0, 0, 0)
    }
}