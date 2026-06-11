<?php

namespace Database\Factories;

use App\Models\Reason;
use App\Models\Channel;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReasonFactory extends Factory
{
    protected $model = Reason::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->sentence(3),
            'channel_id' => Channel::factory(),
            'responsible_dept' => $this->faker->word . ' Dept',
        ];
    }
}
