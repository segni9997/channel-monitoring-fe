<?php

namespace Database\Factories;

use App\Models\Incident_User_;
use App\Models\Incident;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class IncidentUserFactory extends Factory
{
    protected $model = Incident_User_::class;

    public function definition(): array
    {
        return [
            'incidentId' => Incident::factory(),
            'userId' => User::factory(),
            'involvement' => $this->faker->randomElement(['reporter', 'resolver', 'both']),
        ];
    }
}
