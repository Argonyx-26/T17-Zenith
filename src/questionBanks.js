function makeQuestion(id, concept, prompt, correct, correctExplanation, distractors) {
  return {
    id,
    concept,
    prompt,
    explanation: correctExplanation,
    options: [
      { label: String(correct), isCorrect: true, explanation: correctExplanation, misconception: '' },
      ...distractors.map(([label, explanation, misconception]) => ({
        label: String(label),
        isCorrect: false,
        explanation,
        misconception,
      })),
    ],
  }
}

function makeBank(subject, templates) {
  return templates.flatMap((template, templateIndex) => [1, 2, 3].map((variant) => (
    template(variant, `${subject.toLowerCase().replaceAll(' ', '-')}-${templateIndex + 1}-${variant}`)
  )))
}

const mathTemplates = [
  (v, id) => {
    const denominator = v + 2
    return makeQuestion(id, 'Fractions', `What is 1/${denominator} + ${denominator - 1}/${denominator}?`, '1', 'The denominators match, so add the numerators: (1 + denominator - 1) / denominator = 1.', [
      [`${denominator + 1}/${denominator}`, 'This adds an extra numerator unit but leaves the denominator unchanged.', 'The numerator was changed without preserving the fraction value.'],
      [`${denominator - 1}/${denominator}`, 'This keeps only the second numerator and drops the first fraction.', 'A numerator was dropped during fraction addition.'],
      [`${denominator + 2}/${denominator}`, 'This adds the numerators but does not combine their values over the common denominator.', 'The common denominator rule was not applied.'],
    ])
  },
  (v, id) => {
    const coefficient = v + 2
    const constant = v
    const right = coefficient * 2 + constant
    return makeQuestion(id, 'Algebra', `Solve ${coefficient}x + ${constant} = ${right}.`, '2', 'Subtract the same constant from both sides, then divide by the coefficient. The result is x = 2.', [
      [String(right), 'This stops after moving the constant and forgets to divide by the coefficient.', 'The equation was not divided by its coefficient.'],
      [String(coefficient * 2), 'This multiplies the coefficient and solution instead of isolating x.', 'The coefficient was multiplied instead of divided.'],
      [String(v + 3), 'This transfers the constant but does not preserve the equation balance.', 'The equation balance was lost while isolating x.'],
    ])
  },
  (v, id) => {
    const length = v + 3
    const width = v + 1
    const area = length * width
    return makeQuestion(id, 'Geometry', `A rectangle is ${length} cm long and ${width} cm wide. What is its area?`, `${area} cm²`, 'Area is length multiplied by width, so multiply the two side measurements.', [
      [`${2 * (length + width)} cm²`, 'This is the perimeter formula, not the area formula.', 'Perimeter was used instead of area.'],
      [`${length + width} cm²`, 'This adds the side lengths instead of multiplying them.', 'Side lengths were added instead of multiplied.'],
      [`${length * length} cm²`, 'This uses the length twice and ignores the width.', 'The width was omitted from the area calculation.'],
    ])
  },
  (v, id) => {
    const coefficient = v + 4
    const solution = v + 2
    return makeQuestion(id, 'Algebra', `Solve ${coefficient}x = ${coefficient * solution}.`, String(solution), 'Divide both sides by the same non-zero coefficient to isolate x.', [
      [String(coefficient * solution), 'This repeats the right side without dividing by the coefficient.', 'The coefficient was not divided out.'],
      [String(coefficient), 'This returns the coefficient instead of solving for the variable.', 'The coefficient was mistaken for the solution.'],
      [String(solution + 1), 'This adds one instead of undoing multiplication with division.', 'Multiplication was not undone with division.'],
    ])
  },
  (v, id) => {
    const total = 40 * v
    const correct = 10 * v
    return makeQuestion(id, 'Fractions', `What is 25% of ${total}?`, String(correct), 'Twenty-five percent is one quarter. Divide the total by four.', [
      [String(total), 'This gives the full amount instead of one quarter of it.', 'The percent amount was treated as the whole.'],
      [String(5 * v), 'This finds 12.5%, half of the requested percentage.', 'The percentage was halved.'],
      [String(20 * v), 'This finds 50%, twice the requested percentage.', 'The percentage was doubled.'],
    ])
  },
  (v, id) => {
    const length = v + 5
    const width = v + 2
    const perimeter = 2 * (length + width)
    return makeQuestion(id, 'Geometry', `A rectangle is ${length} m by ${width} m. What is its perimeter?`, `${perimeter} m`, 'Perimeter is the distance around the shape: add all four sides, or use 2 × (length + width).', [
      [`${length * width} m²`, 'This multiplies length and width to find area.', 'Area was calculated instead of perimeter.'],
      [`${length + width} m`, 'This counts only one length and one width.', 'Only two sides were counted.'],
      [`${2 * length + width} m`, 'This counts the length twice but the width only once.', 'One width side was omitted.'],
    ])
  },
  (v, id) => {
    const result = v * v + 2
    return makeQuestion(id, 'Algebra', `Evaluate x² + 2 when x = ${v}.`, String(result), 'Substitute the value for x, square it first, then add two.', [
      [String((v + 2) ** 2), 'This adds two to x before squaring.', 'The order of operations was reversed.'],
      [String(v * v), 'This squares x but leaves out the final addition.', 'The constant term was omitted.'],
      [String(v + 5), 'This adds x and two rather than squaring x.', 'The exponent was ignored.'],
    ])
  },
  (v, id) => makeQuestion(id, 'Fractions', `Simplify the ratio ${v}:${2 * v}.`, '1:2', 'Divide both parts of a ratio by their common factor.', [
    ['2:1', 'This reverses the order of the two quantities.', 'The ratio order was reversed.'],
    [`${2 * v}:${4 * v}`, 'This is equivalent but not simplified.', 'The common factor was not removed.'],
    ['1:1', 'This changes the relationship between the two quantities.', 'Equal parts were assumed when the ratio is not equal.'],
  ]),
  (v, id) => {
    const secondAngle = 40 + v * 10
    const answer = 180 - 45 - secondAngle
    return makeQuestion(id, 'Geometry', `A triangle has angles 45° and ${secondAngle}°. What is the third angle?`, `${answer}°`, 'The three interior angles of a triangle sum to 180°, so subtract the two known angles.', [
      [`${180 - answer}°`, 'This subtracts only one of the known angles from 180°.', 'One known angle was not subtracted.'],
      ['45°', 'This repeats the first angle instead of finding the missing angle.', 'A known angle was copied as the missing angle.'],
      [`${secondAngle}°`, 'This repeats the second angle instead of using the angle sum.', 'The angle sum property was not used.'],
    ])
  },
  (v, id) => makeQuestion(id, 'Fractions', `Which ratio is equivalent to ${v}/${v + 2}?`, `${3 * v}/${3 * v + 6}`, 'Multiply both numerator and denominator by the same non-zero number to preserve the fraction.', [
    [`${v}/${3 * v + 6}`, 'Only the denominator was multiplied, changing the value.', 'Only the denominator was scaled.'],
    [`${3 * v}/${v + 2}`, 'Only the numerator was multiplied, changing the value.', 'Only the numerator was scaled.'],
    [`${v + 3}/${v + 5}`, 'Adding the same amount to both parts does not preserve a fraction.', 'Equal amounts were added instead of multiplying.'],
  ]),
]

const pythonTemplates = [
  (v, id) => {
    const limit = v + 4
    const count = Math.ceil(limit / 2)
    return makeQuestion(id, 'Loops', `How many even numbers are produced by [n for n in range(${limit}) if n % 2 == 0]?`, String(count), 'range stops before its endpoint. The even values begin at zero and increase by two.', [
      [String(limit), 'This counts every value, not just the even values.', 'The filter condition was ignored.'],
      [String(Math.max(1, count - 1)), 'This misses one of the even values, including the starting zero.', 'The zero starting value was omitted.'],
      [String(count + 1), 'This includes the range endpoint, which range excludes.', 'The exclusive range endpoint was included.'],
    ])
  },
  (v, id) => {
    const animals = ['cat', 'dog', 'owl', 'fox']
    const index = v - 1
    return makeQuestion(id, 'Syntax', `What does animals[${index}] return for animals = ['cat', 'dog', 'owl', 'fox']?`, animals[index], 'Python list indexes start at zero, so this index selects the item in that position.', [
      [animals[(index + 1) % animals.length], 'This is the next list position, not the requested zero-based index.', 'List indexing was shifted by one.'],
      [animals[(index + 2) % animals.length], 'This skips one extra item in the list.', 'The index advanced too far.'],
      ['IndexError', 'This index is within the four-item list.', 'The valid zero-based index range was miscounted.'],
    ])
  },
  (v, id) => {
    const length = 2 + v
    return makeQuestion(id, 'Syntax', `What does len('py' + '!' * ${v}) return?`, String(length), 'The first string has two characters and the repeated exclamation marks add one character each.', [
      [String(2 * v + 3), 'This doubles the repeated segment and leaves out its exact character count.', 'The repeated string length was miscounted.'],
      [String(v), 'This counts only the repeated characters.', 'The prefix characters were not counted.'],
      [String(length + 1), 'This counts one extra character beyond the concatenated strings.', 'A character was counted twice.'],
    ])
  },
  (v, id) => {
    const input = v + 3
    return makeQuestion(id, 'Functions', `If double(n) returns n * 2, what does double(${input}) return?`, String(input * 2), 'The function doubles its argument, so multiply the input by two.', [
      [String(input + 2), 'This adds two instead of multiplying by two.', 'The function operation was mistaken for addition.'],
      [String(input), 'This returns the input unchanged.', 'The function body was not applied.'],
      [String(input * input), 'This squares the input rather than doubling it.', 'Multiplication by two was confused with exponentiation.'],
    ])
  },
  (v, id) => {
    const stop = v + 2
    const sum = stop * (stop - 1) / 2
    return makeQuestion(id, 'Loops', `What is sum(range(${stop}))?`, String(sum), `range(${stop}) contains integers from zero through ${stop - 1}; add those values.`, [
      [String(sum + stop), 'This includes the stop value, which range excludes.', 'The stop value was included.'],
      [String(stop * stop), 'This multiplies the range length by itself instead of summing its values.', 'The range length was squared.'],
      [String(sum - 1), 'This omits one of the values in the range.', 'A value was skipped during the sum.'],
    ])
  },
  (v, id) => {
    const value = v + 5
    const result = value % 3
    return makeQuestion(id, 'Syntax', `What is ${value} % 3 in Python?`, String(result), 'The modulo operator returns the remainder after integer division.', [
      [String((result + 1) % 3), 'This is the next possible remainder, not the value left by this division.', 'The division remainder was miscalculated.'],
      ['3', 'This is the divisor, not the remainder.', 'The divisor was returned.'],
      [String(value), 'This returns the original value without applying modulo.', 'The modulo operator was ignored.'],
    ])
  },
  (v, id) => {
    const startLength = v + 2
    return makeQuestion(id, 'Syntax', `A list has ${startLength} items. How many items after one append?`, String(startLength + 1), 'append adds exactly one item to the end of the list.', [
      [String(startLength), 'This is the original list length before append.', 'The append operation was not counted.'],
      [String(startLength + 2), 'This counts two additions even though append was called once.', 'One append was counted twice.'],
      ['1', 'This is the number appended, not the new list length.', 'The new item count was confused with list length.'],
    ])
  },
  (v, id) => {
    const score = v * 10
    return makeQuestion(id, 'Functions', `What value is stored at scores['quiz'] after scores = {'quiz': ${score}}?`, String(score), 'A dictionary lookup by the matching key returns its associated value.', [
      ['quiz', 'This is the key name, not the value stored at that key.', 'The dictionary key was returned instead of its value.'],
      [String(v), 'This drops the tens place from the stored value.', 'A digit place was omitted.'],
      ['KeyError', 'The quiz key exists in the dictionary.', 'The dictionary entry was overlooked.'],
    ])
  },
  (v, id) => makeQuestion(id, 'Loops', `Is ${v * 3} >= ${v * 2} true?`, 'True', 'The left value is larger, so the greater-than-or-equal comparison is true.', [
    ['False', 'The left value is larger than the right value.', 'The comparison direction was reversed.'],
    ['None', 'A comparison expression returns a Boolean value.', 'A Boolean result was confused with no return value.'],
    ['Equal', 'The values differ, so they are not equal.', 'Greater-than comparison was mistaken for equality.'],
  ]),
  (v, id) => {
    const result = v + 5
    return makeQuestion(id, 'Functions', `What is int(str(${v + 3})) + 2?`, String(result), 'str converts the number to text and int converts it back to the same integer before adding two.', [
      [String(v + 3), 'This omits the final addition of two.', 'The final arithmetic step was omitted.'],
      [`${v + 3}2`, 'This concatenates text rather than converting it back to an integer.', 'String concatenation was used instead of integer addition.'],
      [String((v + 3) * 2), 'This doubles the converted value instead of adding two.', 'Addition was confused with multiplication.'],
    ])
  },
]

const scienceTemplates = [
  (v, id) => {
    const mass = v + 2
    const acceleration = 3
    return makeQuestion(id, 'Forces', `What force acts on a ${mass} kg object accelerating at 3 m/s²?`, `${mass * acceleration} N`, 'Newton’s second law is force = mass × acceleration.', [
      [`${mass + acceleration} N`, 'This adds mass and acceleration instead of multiplying them.', 'Force inputs were added instead of multiplied.'],
      [`${mass} N`, 'This ignores the acceleration value.', 'Acceleration was omitted.'],
      ['0 N', 'This assumes there is no net force even though the object is accelerating.', 'Acceleration was not connected to a net force.'],
    ])
  },
  (v, id) => {
    const mass = 12 * v
    const volume = 3
    return makeQuestion(id, 'Matter', `What is the density of ${mass} g of material in ${volume} cm³?`, `${mass / volume} g/cm³`, 'Density is mass divided by volume.', [
      [`${mass * volume} g/cm³`, 'This multiplies mass and volume rather than dividing.', 'Density was calculated with multiplication.'],
      [`${volume / mass} g/cm³`, 'This reverses the density formula.', 'The density ratio was inverted.'],
      [`${mass + volume} g/cm³`, 'This adds the measurements instead of finding mass per unit volume.', 'Mass and volume were added.'],
    ])
  },
  (v, id) => {
    const organelles = [
      ['mitochondrion', 'releases usable energy from food'],
      ['nucleus', 'stores DNA and directs cell activities'],
      ['cell membrane', 'controls what enters and leaves the cell'],
    ]
    const [name, role] = organelles[v - 1]
    return makeQuestion(id, 'Cells', `Which cell part ${role}?`, name, `The ${name} is associated with this role in the cell.`, organelles.filter(([other]) => other !== name).map(([other, otherRole]) => [other, `The ${other} ${otherRole}.`, `Cell structures were confused: ${other} and ${name} have different roles.`]).concat([['ribosome', 'Ribosomes build proteins, which is a different role.', 'Protein building was confused with this cell function.']]))
  },
  (v, id) => {
    const correct = ['carbon dioxide', 'oxygen', 'heat'][v - 1]
    const prompt = [
      'Which gas do plants take in for photosynthesis?',
      'Which gas is released by plants during photosynthesis?',
      'What energy input drives water to evaporate from a puddle?',
    ][v - 1]
    const why = [
      'Photosynthesis uses carbon dioxide and water to build sugars.',
      'Oxygen is released as a byproduct when plants photosynthesize.',
      'Heat gives water particles energy to escape into the air.',
    ][v - 1]
    return makeQuestion(id, 'Energy', prompt, correct, why, [['nitrogen', 'Nitrogen is not the requested input or output for this process.', 'A common atmospheric gas was mistaken for a process input.'], ['sugar', 'Sugar is a product or stored energy, not the requested gas or energy input.', 'A product was confused with an input.'], ['soil', 'Soil may support a plant, but it is not the requested gas or energy transfer.', 'Growing conditions were confused with the process itself.']])
  },
  (v, id) => {
    const temperature = 100 + (v - 2) * 10
    return makeQuestion(id, 'Matter', `At about ${temperature}°C, what happens to liquid water as it reaches its boiling point?`, 'It changes into water vapor.', 'Boiling changes liquid water into a gas as particles gain enough energy to separate.', [['It freezes into ice.', 'Freezing changes liquid water into a solid at much lower temperatures.', 'Freezing and boiling were confused.'], ['It becomes a different element.', 'A change of state does not change water’s chemical identity.', 'A physical change was mistaken for a chemical change.'], ['It disappears completely.', 'The water changes state and remains matter as vapor.', 'Matter conservation was overlooked.']])
  },
  (v, id) => makeQuestion(id, 'Forces', `What motion of Earth causes the day-night cycle in about ${24 + (v - 2) * 2} hours?`, 'Earth rotating on its axis', 'As Earth rotates, locations move into and out of sunlight.', [['Earth orbiting the Sun.', 'Earth’s orbit takes about a year, not one day.', 'Rotation and revolution were confused.'], ['The Moon orbiting Earth.', 'The Moon’s orbit does not create the daily day-night cycle.', 'A lunar motion was confused with Earth’s rotation.'], ['The Sun orbiting Earth.', 'Earth rotates while it orbits the Sun.', 'The apparent motion of the Sun was treated as its orbit around Earth.']]),
  (v, id) => {
    const habitats = ['pond', 'forest', 'grassland']
    const habitat = habitats[v - 1]
    return makeQuestion(id, 'Energy', `Which organism is a producer in a ${habitat} ecosystem?`, 'A green plant or algae', 'Producers use sunlight to make food and introduce energy into food webs.', [['A fox', 'A fox is a consumer that gets energy by eating other organisms.', 'Consumers were confused with producers.'], ['A mushroom', 'A mushroom is a decomposer, not a photosynthetic producer.', 'Decomposers were confused with producers.'], ['A hawk', 'A hawk is a consumer in the food web.', 'A predator was confused with a producer.']])
  },
  (v, id) => {
    const materials = [['rubber', 'wire coating'], ['plastic', 'tool handle'], ['dry wood', 'small electrical model']]
    const [material, context] = materials[v - 1]
    return makeQuestion(id, 'Forces', `Which material is a good electrical insulator for a ${context}?`, material, 'Insulators resist the flow of electric charge and help protect people from current.', [['copper', 'Copper is a conductor that allows charge to flow.', 'A conductor was mistaken for an insulator.'], ['aluminum', 'Aluminum is a metal conductor.', 'A metal conductor was selected.'], ['silver', 'Silver conducts electricity very well.', 'High conductivity was confused with insulation.']])
  },
  (v, id) => makeQuestion(id, 'Cells', `An object is taken from Earth to the Moon. What happens to its mass?`, 'Its mass stays the same.', 'Mass measures the amount of matter in an object and does not depend on location.', [['Its mass becomes smaller.', 'Its weight changes with gravity, but its mass does not.', 'Mass was confused with weight.'], ['Its mass becomes zero.', 'The object still contains the same matter on the Moon.', 'A change in gravity was mistaken for losing matter.'], ['Its mass doubles.', 'Changing location does not double the object’s amount of matter.', 'A location change was mistaken for a change in matter.']]),
  (v, id) => {
    const decomposers = [['mushroom', 'forest floor'], ['bacteria', 'compost pile'], ['earthworm', 'garden soil']]
    const [organism, place] = decomposers[v - 1]
    return makeQuestion(id, 'Cells', `Which organism helps break down dead material in a ${place}?`, organism, 'Decomposers break down dead organisms and return nutrients to the ecosystem.', [['rabbit', 'A rabbit is a consumer, not a decomposer.', 'A consumer was mistaken for a decomposer.'], ['grass', 'Grass is a producer that uses sunlight to make food.', 'A producer was mistaken for a decomposer.'], ['eagle', 'An eagle is a predator and consumer.', 'A predator was mistaken for a decomposer.']])
  },
]

export const questionBanks = {
  Mathematics: makeBank('math', mathTemplates),
  'Python Coding': makeBank('python', pythonTemplates),
  'General Science': makeBank('science', scienceTemplates),
}

export function pickRandomQuestions(subject, count = 10) {
  const pool = [...(questionBanks[subject] ?? [])]
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]]
  }
  return pool.slice(0, count).map((question) => {
    const options = [...question.options]
    for (let index = options.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1))
      ;[options[index], options[swapIndex]] = [options[swapIndex], options[index]]
    }
    return { ...question, options }
  })
}