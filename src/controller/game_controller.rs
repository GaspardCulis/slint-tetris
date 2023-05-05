use crate::{game::Game, pieces, ui::*};
use slint::*;
use std::{cell::RefCell, rc::Rc, time::Duration};

pub fn setup(window: &AppWindow, game: Rc<RefCell<Game>>) -> Timer {
    window.global::<GameAdapter>().set_grid_size(Size {
        height: Game::GRID_HEIGHT.into(),
        width: Game::GRID_WIDTH.into(),
    });

    let update_timer = Timer::default();
    update_timer.start(TimerMode::Repeated, Duration::from_millis(30), {
        let weak_window = window.as_weak();

        move || {
            let window = weak_window.unwrap();
            let game_adapter = window.global::<GameAdapter>();
            if game.borrow().is_game_over() {
                game_adapter.set_game_over(true);
                game_adapter.set_playing(false);
            }
            update_ui(&game_adapter, &game.borrow());
        }
    });

    update_timer
}

fn update_ui(game_grid_adapter: &GameAdapter, game: &Game) {
    if !game_grid_adapter.get_playing() {
        return;
    };
    // Grid
    let grid = game.get_grid();
    let vec = VecModel::<ModelRc<slint::Color>>::default();
    for i in 0..Game::GRID_HEIGHT {
        let row = VecModel::<Color>::default();
        for j in 0..Game::GRID_WIDTH {
            row.insert(j.into(), col2col(grid[i as usize][j as usize]));
        }
        vec.insert(i.into(), Rc::new(row).clone().into());
    }
    // Current piece
    let current = game.get_current();
    for cell in current.get_shape() {
        let x = current.x + cell.0 as i16;
        let y = current.y + cell.1 as i16;

        let row = vec.row_data(y as usize);
        if row.is_some() {
            row.unwrap()
                .set_row_data(x as usize, col2col(Some(current.piece.color)));
        }
    }
    game_grid_adapter.set_grid(Rc::new(vec).clone().into());

    // Next piece
    let next = game.get_next();
    game_grid_adapter.set_next_piece(SPiece {
        blocks: piece_to_model(next),
        is_I: next.color == pieces::Color::CYAN,
        is_O: next.color == pieces::Color::YELLOW,
    });

    // Held piece
    if game.get_held().is_some() {
        let held = game.get_held().unwrap();
        game_grid_adapter.set_held_piece(SPiece {
            blocks: piece_to_model(&held),
            is_I: held.color == pieces::Color::CYAN,
            is_O: held.color == pieces::Color::YELLOW,
        });
    }

    // Score
    game_grid_adapter.set_score(game.get_score() as i32);
}

fn piece_to_model(piece: &pieces::Piece) -> ModelRc<ModelRc<Color>> {
    let piece_shape = piece.get_shape(0);
    let vec = VecModel::<ModelRc<slint::Color>>::default();
    for i in 0..4 {
        let row = VecModel::<slint::Color>::from_slice(&[
            col2col(None),
            col2col(None),
            col2col(None),
            col2col(None),
        ]);
        vec.insert(i, row);
    }
    for cell in piece_shape {
        let x = cell.0 as usize;
        let y = cell.1 as usize;

        let row = vec.row_data(y);
        row.unwrap().set_row_data(x, col2col(Some(piece.color)));
    }

    Rc::new(vec).clone().into()
}

fn col2col(color: Option<pieces::Color>) -> slint::Color {
    match color {
        Some(pieces::Color::CYAN) => slint::Color::from_rgb_u8(82, 177, 252),
        Some(pieces::Color::BLUE) => slint::Color::from_rgb_u8(60, 118, 181),
        Some(pieces::Color::ORANGE) => slint::Color::from_rgb_u8(255, 92, 27),
        Some(pieces::Color::YELLOW) => slint::Color::from_rgb_u8(251, 206, 5),
        Some(pieces::Color::GREEN) => slint::Color::from_rgb_u8(67, 213, 97),
        Some(pieces::Color::PURPLE) => slint::Color::from_rgb_u8(164, 105, 184),
        Some(pieces::Color::RED) => slint::Color::from_rgb_u8(255, 1, 39),
        None => slint::Color::from_argb_u8(0, 0, 0, 0),
    }
}
