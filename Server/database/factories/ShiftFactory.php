<?php

namespace Database\Factories;

use App\Models\Shift;
use Illuminate\Database\Eloquent\Factories\Factory;

class ShiftFactory extends Factory
{
    protected $model = Shift::class;

    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('-1 week', 'now');
        $end = $this->faker->optional(0.9)->dateTimeBetween($start, '+8 hours');

        return [
            'start_time' => $start,
            'end_time' => $end,
        ];
    }
}
