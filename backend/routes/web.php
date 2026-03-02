<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\FormationController;

Route::get('/', function () {
    return view('welcome');
});
