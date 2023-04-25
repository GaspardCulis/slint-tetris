use crate::{ui::*, game::Game, pieces};
use std::time::Duration;
use slint::*;

pub fn setup(window: &AppWindow, game: Game) -> Timer {
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
    for (i, row) in game.get_grid().iter().enumerate() {
        game_grid_adapter.get_grid().set_row_data(i, ModelRc<slint::Color>::new([]));
        for (j, cell) in row.iter().enumerate() {
            game_grid_adapter.get_grid().row_data(i).insert(ModelRc::<slint::Color>::from(slint::Color{red: 0, green: 0, blue: 0, alpha: 0}));
        }
    }
}

fn col2col(color: Option<pieces::Color>) -> slint::Color {
    match color {
        Some(pieces::Color::CYAN) => slint::Color{red: 0, green: 255, blue: 255, alpha: 255},
        Some(pieces::Color::BLUE) => slint::Color{red: 0, green: 0, blue: 255, alpha: 255},
        Some(pieces::Color::ORANGE) => slint::Color{red: 255, green: 165, blue: 0, alpha: 255},
        Some(pieces::Color::YELLOW) => slint::Color{red: 255, green: 255, blue: 0, alpha: 255},
        Some(pieces::Color::GREEN) => slint::Color{red: 0, green: 255, blue: 0, alpha: 255},
        Some(pieces::Color::PURPLE) => slint::Color{red: 128, green: 0, blue: 128, alpha: 255},
        Some(pieces::Color::RED) => slint::Color{red: 255, green: 0, blue: 0, alpha: 255},
        None => slint::Color{red: 0, green: 0, blue: 0, alpha: 0}
    }
}