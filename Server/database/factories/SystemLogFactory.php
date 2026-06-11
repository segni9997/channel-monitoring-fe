<?php

namespace Database\Factories;

use App\Models\SystemLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SystemLogFactory extends Factory
{
    protected $model = SystemLog::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'user_name' => $this->faker->name,
            'action' => $this->faker->randomElement(['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT']),
            'details' => ['message' => $this->faker->sentence],
            'old_values' => null,
            'new_values' => ['field' => 'value'],
            'ip_address' => $this->faker->ipv4,
            'user_agent' => $this->faker->userAgent,
        ];
    }
}
