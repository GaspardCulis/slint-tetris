use slint::PhysicalSize;

mod pieces;
mod game;

slint::include_modules!();

fn main() -> Result<(), slint::PlatformError> {
    let ui = AppWindow::new()?;

    let ui_handle = ui.as_weak();

    ui.run()
}
