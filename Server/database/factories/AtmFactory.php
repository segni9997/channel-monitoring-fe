<?php

namespace Database\Factories;

use App\Models\Atm;
use App\Models\Branch;
use Illuminate\Database\Eloquent\Factories\Factory;

class AtmFactory extends Factory
{
    protected $model = Atm::class;

    public function definition(): array
    {
        return [
            'name' => 'ATM-' . $this->faker->unique()->numberBetween(1000, 9999),
            'branch_id' => Branch::factory(),
        ];
    }
}
